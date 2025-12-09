"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, XCircle } from "lucide-react";
import { Socket } from "socket.io-client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { validateChatMessage, CHAT_MESSAGE_MAX_LENGTH } from "@/lib/validation";

interface Message {
    from: string;
    message: string;
}

interface LiveChatProps {
    socket: Socket;
    username: string; // The other person's username (or "Anonymous")
    isOwner: boolean;
    onTerminate: () => void;
    roomId: string; // Unique room ID for this chat session
}

export function LiveChat({
    socket,
    username,
    isOwner,
    onTerminate,
    roomId,
}: LiveChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [showTerminateDialog, setShowTerminateDialog] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Listen for incoming messages
        socket.on("receive_message", (data) => {
            setMessages((prev) => [
                ...prev,
                { from: data.from, message: data.message },
            ]);
        });

        // Listen for chat termination
        socket.on("chat_terminated", () => {
            onTerminate();
        });

        // Security event handlers
        socket.on("rate_limited", (data) => {
            toast({
                title: "Slow Down",
                description: data.message,
                variant: "destructive",
            });
        });

        socket.on("message_blocked", (data) => {
            toast({
                title: "Message Blocked",
                description: data.reason,
                variant: "destructive",
            });
        });

        socket.on("message_error", (data) => {
            toast({
                title: "Invalid Message",
                description: data.error,
                variant: "destructive",
            });
        });

        socket.on("error", (data) => {
            toast({
                title: "Error",
                description: data.message,
                variant: "destructive",
            });
        });

        return () => {
            socket.off("receive_message");
            socket.off("chat_terminated");
            socket.off("rate_limited");
            socket.off("message_blocked");
            socket.off("message_error");
            socket.off("error");
        };
    }, [socket, roomId, onTerminate, toast]);

    const sendMessage = () => {
        if (!inputMessage.trim()) return;

        // Validate and sanitize
        const validation = validateChatMessage(inputMessage);
        if (!validation.valid) {
            toast({
                title: "Invalid Message",
                description: validation.error,
                variant: "destructive",
            });
            return;
        }

        socket.emit("send_message", {
            roomId,
            message: validation.sanitized,
            from: isOwner ? "Owner" : "Anonymous",
        });

        // Optimistic update with sanitized message
        setMessages((prev) => [
            ...prev,
            { from: "Me", message: validation.sanitized! },
        ]);
        setInputMessage("");
    };

    const handleTerminateClick = () => {
        setShowTerminateDialog(true);
    };

    const confirmTerminate = () => {
        socket.emit("terminate_chat", { roomId });
        onTerminate();
        setShowTerminateDialog(false);
    };

    return (
        <div className="flex flex-col h-[400px] border rounded-lg overflow-hidden bg-white shadow-lg">
            <div className="bg-primary p-4 text-primary-foreground flex justify-between items-center">
                <h3 className="font-bold">Live Chat with {username}</h3>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleTerminateClick}
                    title="End chat"
                >
                    <XCircle className="h-5 w-5" />
                </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.from === "Me" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${msg.from === "Me"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                    }`}
                            >
                                <p className="text-sm">{msg.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 border-t flex gap-2">
                <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    maxLength={CHAT_MESSAGE_MAX_LENGTH}
                />
                <Button onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                </Button>
            </div>

            <AlertDialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>End Chat?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to end this chat? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmTerminate}>
                            End Chat
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
