"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Bookmark, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ThinkingIndicator from "./ThinkingIndicator";
import type { ScanSession } from "./types";
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
  const bottomRef = useRef<HTMLDivElement>(null);
  // Id of the message whose reply we gave up waiting for (failsafe below).
  const [timedOutMessageId, setTimedOutMessageId] = useState<string | null>(
    null,
  );

  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useDispatch();
 
  const client_id = params.get("session") ?? "";

  const { isAgentConnected, messages } = useSelector(
    (state: RootState) => state.session,
  );

  useSocketManager({ sessionID: client_id });

  // Derived, not stored: we're waiting exactly while the newest message is the
  // user's own. `agent` events are handled once, in useSocketManager, so the
  // indicator disappears the moment the first reply lands in the store.
  const lastMessage = messages?.at(-1);
  const isLoading =
    lastMessage?.role === "user" && lastMessage.id !== timedOutMessageId;

  // Failsafe: if the agent never answers (error, dropped socket), don't leave
  // the composer disabled behind an indicator that spins forever.
  useEffect(() => {
    if (!isLoading || !lastMessage) return;
    const pendingId = lastMessage.id;
    const timer = setTimeout(() => setTimedOutMessageId(pendingId), 60_000);
    return () => clearTimeout(timer);
  }, [isLoading, lastMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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

  const handleSend = async (text: string) => {
    if (isLoading) return;

    dispatch(
      setGhostMessages({
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: new Date(),
      }),
    );

    if (!isAgentConnected) {
      // `/connect` only mints the session. The message itself is held until the
      // socket is up, because the agent streams back to the socket's sid.
      pendingMessageRef.current = text;
      const response = await scanService.Connect();
      router.replace(`?session=${response.client_id}`);
    } else {
      getSocket()?.emit("client", { message: text, client_id: client_id });
    }
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
        {isLoading && <ThinkingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </SidebarInset>
  );
}
