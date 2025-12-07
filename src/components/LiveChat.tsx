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

    useEffect(() => {
        // Join the chat room
        socket.emit("join_chat_room", { roomId });

        socket.on("receive_message", (data: Message) => {
            setMessages((prev) => [...prev, data]);
        });

        socket.on("chat_terminated", () => {
            alert("Chat ended by the other user.");
            onTerminate();
        });

        return () => {
            socket.off("receive_message");
            socket.off("chat_terminated");
        };
    }, [socket, onTerminate, roomId]);

    const sendMessage = () => {
        if (!inputMessage.trim()) return;

        socket.emit("send_message", {
            roomId,
            message: inputMessage,
            from: isOwner ? "Owner" : "Anonymous",
        });

        // Optimistic update
        setMessages((prev) => [
            ...prev,
            { from: "Me", message: inputMessage },
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
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
