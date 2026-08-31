"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Bookmark, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import type { Message, ScanSession } from "./types";
import scanService from "@/services/scanService";
import { getSocket, useSocketManager } from "@/hooks/useSocket";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { setGhostMessages } from "@/store/reducers/sessionSlice";



interface ChatPanelProps {
  session: ScanSession;
}

export default function ChatPanel({ session }: ChatPanelProps) {
  // const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useDispatch();
 
  const client_id = params.get("session") ?? "";

  const { isAgentConnected, socket_id,messages } = useSelector(
    (state: RootState) => state.session,
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const { _ID } = useSocketManager({
    sessionID: client_id,
    isClientConnected: isAgentConnected,
  });

  const pendingMessageRef = useRef<string | null>(null);

  useEffect(() => {
    if (isAgentConnected && pendingMessageRef.current) {
      const socket = getSocket();
      console.log("[FIRST MSG]", pendingMessageRef.current, "->>>", socket);
      socket?.emit("client", {
        message: pendingMessageRef.current,
        client_id: client_id,
        first_msg: true,
      });
      pendingMessageRef.current = null;
    }
  }, [isAgentConnected, client_id]);

  useEffect(() => {
    if (!isAgentConnected) return;
    const socket = getSocket();
    if (!socket) return;

    const handleAgentMessage = (data: unknown) => {
      console.log("[AGENT]", data);
      // setMessages((prev) =>
      //   prev.map((m) =>
      //     m.isLoading
      //       ? { ...m, content: JSON.stringify(data), isLoading: false }
      //       : m,
      //   ),
      // );
      setIsLoading(false);
    };

    socket.on("agent", handleAgentMessage);
    return () => {
      socket.off("agent", handleAgentMessage);
    };
  }, [isAgentConnected]);

  const handleSend = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    const loadingMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    // setMessages((prev) => [...prev, userMsg, loadingMsg]);

    dispatch(
      setGhostMessages({
        id: Date.now().toString(),
        role: "user",
        content: text,
        timestamp: new Date(),
      }),
    );
    setIsLoading(true);

    if (!isAgentConnected) {
      pendingMessageRef.current = text;
      console.log(pendingMessageRef.current, "pendingMessageRef.current");

      const response = await scanService.Connect();
      router.replace(`?session=${response.client_id}`);
    } else {
      getSocket()?.emit("client", { message: text, session: client_id });
    }

    await scanService.scanRequest({
      query: text,
    });

    // Simulate AI response
    setTimeout(() => {
      // setMessages((prev) =>
      //   prev.map((m) =>
      //     m.id === loadingMsg.id
      //       ? {
      //           ...m,
      //           content: `Analyzing target from: "${text}". Running scan modules...`,
      //           isLoading: false,
      //         }
      //       : m,
      //   ),
      // );

      // dispatch(
      //   setGhostMessages({
      //     id: Date.now().toString(),
      //     role: "assistant",
      //     content: `Analyzing target from: "${text}". Running scan modules...`,
      //     timestamp: new Date(),
      //   }),
      // );

      setIsLoading(false);
    }, 1800);
  };

  return (
    <SidebarInset className="flex flex-col h-svh">
      {/* Header */}
      <header className="flex items-center gap-2 px-4 h-14 border-b border-border shrink-0">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-sm font-semibold flex-1 truncate">
          {session.title}
        </h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm">
            <Share2 />
            <span className="sr-only">Share</span>
          </Button>
          <Button variant="ghost" size="icon-sm">
            <Bookmark />
            <span className="sr-only">Bookmark</span>
          </Button>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal />
            <span className="sr-only">More</span>
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages?.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </SidebarInset>
  );
}
