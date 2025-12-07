"use client";

import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import * as z from "zod";
import { ApiResponse } from "@/types/apiResponse";
import Link from "next/link";
import { useParams } from "next/navigation";
import { messageSchema } from "@/schemas/messageSchema";
import { io, Socket } from "socket.io-client";
import { LiveChat } from "@/components/LiveChat";

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const [isLoading, setIsLoading] = useState(false);
  const [isLiveChatActive, setIsLiveChatActive] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatStatus, setChatStatus] = useState<
    "idle" | "requesting" | "active" | "declined"
  >("idle");
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkLiveChatStatus = async () => {
      try {
        const response = await axios.get(
          `/api/check-live-chat-status?username=${username}`
        );
        setIsLiveChatActive(response.data.isLiveChatActive);
      } catch {
        console.error("Failed to check live chat status");
      }
    };
    checkLiveChatStatus();
  }, [username]);

  const startLiveChat = async () => {
    // Check live chat status first
    try {
      const response = await axios.get(
        `/api/check-live-chat-status?username=${username}`
      );
      setIsLiveChatActive(response.data.isLiveChatActive);

      if (!response.data.isLiveChatActive) {
        toast({
          title: "User Unavailable",
          description: "This user is not available for live chat right now.",
          variant: "destructive",
        });
        return;
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to check live chat status. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const newSocket = io({
      transports: ["websocket"],
    });
    setSocket(newSocket);
    setChatStatus("requesting");

    newSocket.on("connect", () => {
      console.log("Connected with socket ID:", newSocket.id);
      newSocket.emit("request_chat", { to: username, from: "Anonymous" });
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    newSocket.on("connect_error", (error) => {
      console.log("Socket connection error:", error);
    });

    newSocket.on("chat_accepted", (data) => {
      console.log("Chat accepted event received", data);
      const { roomId } = data;
      setChatRoomId(roomId);

      // Auto-start chat - transition directly to active
      setChatStatus("active");
      console.log("State changed to active, roomId:", roomId);
      toast({
        title: "Chat Started",
        description: "You are now connected with the owner!",
      });

      // Scroll to chat after a brief delay to ensure it's rendered
      setTimeout(() => {
        chatContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    });

    newSocket.on("chat_declined", () => {
      setChatStatus("declined");
      toast({
        title: "Request Declined",
        description: "The owner declined your chat request.",
        variant: "destructive",
      });
      newSocket.disconnect();
    });

    newSocket.on("chat_busy", (data) => {
      console.log("Owner is busy:", data);
      setChatStatus("idle");
      toast({
        title: "Owner is Busy",
        description: data.message || "The owner is currently in another chat. Please try again later.",
        variant: "destructive",
      });
      newSocket.disconnect();
    });
  };

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch("content");

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        ...data,
        username,
      });

      toast({
        title: response.data.message,
        variant: "default",
      });
      form.reset({ ...form.getValues(), content: "" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || !messageContent}>
                Send It
              </Button>
            )}
          </div>
        </form>
      </Form>

      <Separator className="my-6" />

      {/* Live Chat Section - Always visible */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Live Communication
        </h2>

        {chatStatus === "idle" && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Want to chat live with @{username}? Start a real-time conversation!
            </p>
            <Button onClick={startLiveChat} variant="secondary" size="lg">
              Start Live Communication
            </Button>
          </div>
        )}

        {chatStatus === "requesting" && (
          <div className="text-center space-y-4">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-700 font-medium">Waiting for owner to accept...</p>
            <p className="text-sm text-gray-500">The owner will be notified of your request</p>
            <Button
              onClick={() => {
                setChatStatus("idle");
                socket?.disconnect();
              }}
              variant="outline"
              size="sm"
            >
              Cancel Request
            </Button>
          </div>
        )}

        {chatStatus === "active" && socket && chatRoomId && (
          <div ref={chatContainerRef}>
            <LiveChat
              key={chatRoomId}
              socket={socket}
              username={username as string}
              isOwner={false}
              roomId={chatRoomId}
              onTerminate={() => {
                setChatStatus("idle");
                setChatRoomId(null);
                socket.disconnect();
                toast({
                  title: "Chat Ended",
                  description: "The live chat session has ended.",
                });
              }}
            />
          </div>
        )}

        {chatStatus === "declined" && (
          <div className="text-center space-y-4 bg-red-50 p-6 rounded-lg border border-red-200">
            <p className="text-red-700 font-medium">Chat request was declined.</p>
            <p className="text-sm text-gray-600">The owner is not available to chat right now.</p>
            <Button
              onClick={() => setChatStatus("idle")}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>

      <Separator className="my-6" />
      <div className="text-center">
        <div className="mb-4">Create your profile and share the links with other to get anonymous messages</div>
        <Link href={"/signup"}>
          <Button>Create Your Account</Button>
        </Link>
      </div>


    </div>
  );
}
