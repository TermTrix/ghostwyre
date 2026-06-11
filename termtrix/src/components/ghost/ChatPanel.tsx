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

const DEMO_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Welcome to GhostWyre. I can scan networks, check for vulnerabilities, and analyze web targets. Tell me what to scan.",
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: "2",
    role: "user",
    content: "Scan 192.168.1.1 for open ports",
    timestamp: new Date(Date.now() - 90000),
  },
  {
    id: "3",
    role: "assistant",
    content:
      "Port scan complete on 192.168.1.1. Found 4 open ports. Port 3306 (MySQL) with no auth detected — high risk.",
    timestamp: new Date(Date.now() - 60000),
    scanResults: [
      {
        port: 22,
        service: "SSH",
        state: "open",
        risk: "low",
        version: "OpenSSH 8.9",
      },
      {
        port: 80,
        service: "HTTP",
        state: "open",
        risk: "medium",
        version: "nginx 1.22",
      },
      {
        port: 443,
        service: "HTTPS",
        state: "open",
        risk: "info",
        version: "nginx 1.22",
      },
      {
        port: 3306,
        service: "MySQL",
        state: "open",
        risk: "critical",
        version: "8.0.32",
      },
    ],
  },
];

interface ChatPanelProps {
  session: ScanSession;
}

export default function ChatPanel({ session }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setIsLoading(true);

    await scanService.scanRequest({
      query: text,
    });

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? {
                ...m,
                content: `Analyzing target from: "${text}". Running scan modules...`,
                isLoading: false,
              }
            : m,
        ),
      );
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
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </SidebarInset>
  );
}
