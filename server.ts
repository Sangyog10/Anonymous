import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";


const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url!, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error("Error occurred handling", req.url, err);
            res.statusCode = 500;
            res.end("internal server error");
        }
    });

    const io = new Server(httpServer, {
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? (process.env.ALLOWED_ORIGINS?.split(','))
                : "*",
            methods: ["GET", "POST"],
            credentials: true
        },
        // Connection limits for DoS protection
        maxHttpBufferSize: 1e6, // 1MB max message size
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // Track active chat sessions: username -> { roomId, ownerSocketId }
    const activeChatSessions = new Map<string, { roomId: string; ownerSocketId: string }>();

    // Rate limiting
    const messageLimiters = new Map<string, { count: number; resetTime: number }>();
    const requestLimiters = new Map<string, { count: number; resetTime: number }>();

    const MESSAGE_RATE_LIMIT = 10; // messages per window
    const RATE_WINDOW_MS = 10000; // 10 seconds
    const REQUEST_RATE_LIMIT = 3; // chat requests per window  
    const REQUEST_WINDOW_MS = 60000; // 1 minute

    function checkRateLimit(
        socketId: string,
        limiters: Map<string, { count: number; resetTime: number }>,
        limit: number,
        windowMs: number
    ): boolean {
        const now = Date.now();
        const limiter = limiters.get(socketId);

        if (!limiter || now > limiter.resetTime) {
            limiters.set(socketId, {
                count: 1,
                resetTime: now + windowMs
            });
            return true;
        }

        if (limiter.count >= limit) {
            return false;
        }

        limiter.count++;
        return true;
    }

    // Socket middleware for connection throttling
    io.use((socket, next) => {
        const ip = socket.handshake.address;

        // Limit connections per IP
        const connectionsFromIP = Array.from(io.sockets.sockets.values())
            .filter(s => s.handshake.address === ip).length;

        if (connectionsFromIP > 5) {
            return next(new Error('Too many connections from this IP'));
        }

        next();
    });

    io.on("connection", (socket) => {

        socket.on("join_room", (room) => {
            socket.join(room);
        });

        socket.on("request_chat", (data) => {
            try {
                const { to, from } = data;

                // Rate limit chat requests
                if (!checkRateLimit(socket.id, requestLimiters, REQUEST_RATE_LIMIT, REQUEST_WINDOW_MS)) {
                    socket.emit("rate_limited", {
                        message: "Too many chat requests. Please wait before trying again."
                    });
                    return;
                }

                // Check if owner (username: 'to') is already in a chat
                if (activeChatSessions.has(to)) {
                    socket.emit("chat_busy", {
                        message: "The owner is currently in another chat. Please try again later."
                    });
                    return;
                }

                io.to(to).emit("request_chat", { from, socketId: socket.id });
            } catch (error) {
                console.error('Error in request_chat:', error);
                socket.emit("error", { message: "An error occurred. Please try again." });
            }
        });

        socket.on("accept_chat", (data) => {
            try {
                const { to, from, roomId } = data;

                // Get the owner's username from their rooms
                const ownerRooms = Array.from(socket.rooms);
                const ownerUsername = ownerRooms.find(room => room !== socket.id); // Username room

                // Mark owner as busy BEFORE joining the room to prevent race conditions
                if (ownerUsername) {
                    activeChatSessions.set(ownerUsername, {
                        roomId,
                        ownerSocketId: socket.id
                    });
                    console.log(`✓ Marked ${ownerUsername} as busy in room ${roomId}`);
                }

                // Both parties join the same room
                socket.join(roomId);

                // Get the requester's socket and emit directly to it
                const requesterSocket = io.sockets.sockets.get(to);
                if (requesterSocket) {
                    requesterSocket.join(roomId);
                    requesterSocket.emit("chat_accepted", { from, roomId });
                    console.log(`✓ Chat accepted: requester ${to} and owner ${socket.id} joined room ${roomId}`);
                } else {
                    console.error(`✗ ERROR: Could not find socket ${to} to accept chat`);
                    // Clean up if requester is gone
                    if (ownerUsername) {
                        activeChatSessions.delete(ownerUsername);
                    }
                }
            } catch (error) {
                console.error('Error in accept_chat:', error);
                socket.emit("error", { message: "An error occurred. Please try again." });
            }
        });

        socket.on("decline_chat", (data) => {
            const { to } = data;
            const requesterSocket = io.sockets.sockets.get(to);
            if (requesterSocket) {
                requesterSocket.emit("chat_declined");
            } else {
                console.error(`Could not find socket ${to} to decline chat`);
            }
        });

        socket.on("send_message", (data) => {
            try {
                const { roomId, message, from } = data;

                // Rate limit check
                if (!checkRateLimit(socket.id, messageLimiters, MESSAGE_RATE_LIMIT, RATE_WINDOW_MS)) {
                    socket.emit("rate_limited", {
                        message: "You're sending messages too quickly. Please slow down."
                    });
                    return;
                }

                // Broadcast message
                socket.to(roomId).emit("receive_message", {
                    message: message,
                    from
                });
            } catch (error) {
                console.error('Error in send_message:', error);
                socket.emit("error", { message: "Failed to send message. Please try again." });
            }
        });

        socket.on("terminate_chat", (data) => {
            const { roomId } = data;
            // Notify others in the room
            socket.to(roomId).emit("chat_terminated");

            // Clean up busy status
            for (const [username, session] of activeChatSessions.entries()) {
                if (session.roomId === roomId) {
                    activeChatSessions.delete(username);
                    break;
                }
            }

            // Leave the room
            socket.leave(roomId);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected", socket.id);

            // Clean up any active sessions this socket was part of
            for (const [username, session] of activeChatSessions.entries()) {
                if (session.ownerSocketId === socket.id) {
                    activeChatSessions.delete(username);
                    console.log(`Cleared busy status for ${username} (disconnected)`);
                }
            }
        });
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
