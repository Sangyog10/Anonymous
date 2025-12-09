"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from "react";
import { MessageCard } from "@/components/MessageCard";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/model/User";
import { acceptMessagesSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/apiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { io, Socket } from "socket.io-client";
import { LiveChat } from "@/components/LiveChat";
import { useChatRequestSubscription } from "@/hooks/useChatRequest";

const Dashboard = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [isLiveChatActive, setIsLiveChatActive] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = React.useRef<Socket | null>(null);
  const [activeChat, setActiveChat] = useState<{
    socketId: string;
    username: string;
    roomId: string;
  } | null>(null);
  const { toast } = useToast();

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((msg) => String(msg._id) !== messageId));
  };

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessagesSchema),
  });
  const { register, watch, setValue } = form;

  const acceptMessage = watch("acceptMessages");

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>(`/api/accept-message`);
      setValue("acceptMessages", response.data.isAcceptingMessage);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message || "Failed to fetch message",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(true);
      try {
        const response = await axios.get<ApiResponse>(`/api/get-messages`);
        setMessages(response.data.messages || []);
        if (refresh) {
          toast({
            title: "Refreshed Messages",
            description: "Showing latest messages",
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: "Error",
          description:
            axiosError.response?.data.message || "Failed to fetch message",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages, toast]
  );

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptMessage();
    fetchLiveChatStatus();

    const newSocket = io({
      transports: ["websocket"],
    });
    setSocket(newSocket);
    socketRef.current = newSocket;  // Keep ref updated

    newSocket.on("connect", () => {
      console.log("Connected to socket server", newSocket.id);
      if (session?.user?.username) {
        newSocket.emit("join_room", session.user.username);
      }
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [session, setValue, fetchAcceptMessage, fetchMessages]);

  const fetchLiveChatStatus = async () => {
    try {
      const response = await axios.get("/api/toggle-chat");
      setIsLiveChatActive(response.data.isLiveChatActive);
    } catch (error) {
      console.error("Failed to fetch live chat status", error);
    }
  };

  useChatRequestSubscription({
    socketRef,  // Pass the ref instead of the socket
    onAccept: (data) => {
      // Room ID is now generated in the hook
      setActiveChat({
        socketId: data.socketId,
        username: "Anonymous",
        roomId: data.roomId
      });
    },
    onDecline: () => {
      setActiveChat(null);
    },
  });

  //handle switch change
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post("/api/accept-message", {
        acceptMessage: !acceptMessage,
      });
      setValue("acceptMessages", !acceptMessage);
      toast({
        title: response.data.message,
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message || "Failed to fetch message",
        variant: "destructive",
      });
    }
  };

  const handleLiveChatSwitchChange = async () => {
    try {
      const response = await axios.post("/api/toggle-chat", {
        isLiveChatActive: !isLiveChatActive,
      });
      setIsLiveChatActive(!isLiveChatActive);
      toast({
        title: response.data.message,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update live chat status",
        variant: "destructive",
      });
    }
  };

  // const { username } = session?.user as User;
  const username = session?.user.username;
  let baseUrl = "";
  if (typeof window !== "undefined") {
    baseUrl = `${window.location.protocol}//${window.location.host}`;
  }
  // const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Url copied",
      description: "Profile URL has been copied to clipboard",
    });
  };

  if (!session || !session.user) {
    return <div>Please login</div>;
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}
        <p className="text-sm text-gray-500 mb-3">
          You can share this link with others to accept messages from them
        </p>
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessage}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessage ? "On" : "Off"}
        </span>
      </div>
      <div className="mb-4">
        <Switch
          checked={isLiveChatActive}
          onCheckedChange={handleLiveChatSwitchChange}
        />
        <span className="ml-2">
          Live Chat: {isLiveChatActive ? "Active" : "Inactive"}
        </span>
      </div>

      {activeChat && socket && (
        <div className="mb-8">
          <LiveChat
            socket={socket}
            username={activeChat.username}
            isOwner={true}
            roomId={activeChat.roomId}
            onTerminate={() => {
              setActiveChat(null);
              toast({
                title: "Chat Ended",
                description: "The live chat session has ended.",
              });
            }}
          />
        </div>
      )}
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={String(message._id)}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
