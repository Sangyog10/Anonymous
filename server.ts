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
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Track active chat sessions: username -> { roomId, ownerSocketId }
    const activeChatSessions = new Map<string, { roomId: string; ownerSocketId: string }>();

    io.on("connection", (socket) => {

        socket.on("join_room", (room) => {
            socket.join(room);
        });

        socket.on("request_chat", (data) => {
            const { to, from } = data;

            // Check if owner (username: 'to') is already in a chat
            if (activeChatSessions.has(to)) {
                socket.emit("chat_busy", {
                    message: "The owner is currently in another chat. Please try again later."
                });
                return;
            }

            io.to(to).emit("request_chat", { from, socketId: socket.id });
        });

        socket.on("accept_chat", (data) => {
            const { to, from, roomId } = data;

            // Both parties join the same room
            socket.join(roomId);

            // Get the requester's socket and emit directly to it
            const requesterSocket = io.sockets.sockets.get(to);
            if (requesterSocket) {

                const ownerRooms = Array.from(socket.rooms);
                const ownerUsername = ownerRooms.find(room => room !== socket.id); // Username room

                if (ownerUsername) {
                    activeChatSessions.set(ownerUsername, {
                        roomId,
                        ownerSocketId: socket.id
                    });
                }

                requesterSocket.emit("chat_accepted", { from, roomId });
            } else {
                console.error(`✗ ERROR: Could not find socket ${to} to accept chat`);
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

        socket.on("join_chat_room", (data) => {
            const { roomId } = data;
            socket.join(roomId);
        });

        socket.on("send_message", (data) => {
            const { roomId, message, from } = data;
            // Broadcast to room except sender
            socket.to(roomId).emit("receive_message", { message, from });
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
