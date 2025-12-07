"use client";

// import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Socket } from "socket.io-client";

interface ChatRequestToastProps {
    socketRef: React.RefObject<Socket | null>;
    onAccept: (data: { socketId: string; roomId: string }) => void;
    onDecline: () => void;
}

export function useChatRequestSubscription({
    socketRef,
    onAccept,
    onDecline,
}: ChatRequestToastProps) {
    const { toast } = useToast();

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        socket.on("request_chat", (data) => {
            console.log("Incoming chat request data:", data);
            console.log("Requester Socket ID:", data.socketId);
            toast({
                title: "Incoming Chat Request",
                description: "Someone wants to start a live chat with you.",
                action: (
                    <div className="flex gap-2">
                        <ToastAction
                            altText="Accept"
                            onClick={() => {
                                const currentSocket = socketRef.current;
                                console.log("Accept button clicked");
                                console.log("Socket exists:", !!currentSocket);
                                console.log("Socket connected:", currentSocket?.connected);
                                console.log("Socket ID:", currentSocket?.id);
                                console.log("Accepting chat for requester socket:", data.socketId);

                                if (!currentSocket || !currentSocket.connected) {
                                    console.error("Socket not connected! Cannot accept chat.");
                                    toast({
                                        title: "Error",
                                        description: "Connection lost. Please refresh and try again.",
                                        variant: "destructive",
                                    });
                                    return;
                                }

                                // Generate room ID here and pass it along
                                const roomId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                console.log("Generated room ID:", roomId);
                                console.log("Emitting accept_chat event...");

                                currentSocket.emit("accept_chat", {
                                    to: data.socketId,
                                    from: "Owner",
                                    roomId
                                });

                                console.log("accept_chat event emitted, calling onAccept callback");
                                onAccept({ socketId: data.socketId, roomId });
                            }}
                        >
                            Accept
                        </ToastAction>
                        <ToastAction
                            altText="Decline"
                            onClick={() => {
                                const currentSocket = socketRef.current;
                                if (currentSocket && currentSocket.connected) {
                                    currentSocket.emit("decline_chat", { to: data.socketId });
                                }
                                onDecline();
                            }}
                        >
                            Decline
                        </ToastAction>
                    </div>
                ),
                duration: 10000, // 10 seconds to accept
            });
        });

        return () => {
            const socket = socketRef.current;
            if (socket) {
                socket.off("request_chat");
            }
        };
    }, [socketRef, toast, onAccept, onDecline]);
}
