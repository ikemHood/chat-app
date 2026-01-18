"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, Phone, Video, MoreHorizontal, Smile, Paperclip, Send, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  senderId: string;
  status: "sending" | "sent" | "delivered" | "read";
}

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface ChatAreaProps {
  user?: ChatUser;
  messages: Message[];
  currentUserId: string;
  onSendMessage?: (content: string) => void;
  onOpenContactInfo?: () => void;
  isTyping?: boolean;
  isLoading?: boolean;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatMessageDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
  }
}

function MessageBubble({
  message,
  isSent,
  showTimestamp = true,
}: {
  message: Message;
  isSent: boolean;
  showTimestamp?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        isSent ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2.5",
          isSent
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
      {showTimestamp && (
        <div className={cn(
          "flex items-center gap-1 text-[10px] text-muted-foreground",
          isSent ? "flex-row-reverse" : "flex-row"
        )}>
          <span>{formatTime(message.timestamp)}</span>
          {isSent && (
            <span className={cn(
              message.status === "read" ? "text-primary" : "text-muted-foreground"
            )}>
              {message.status === "sending" ? "○" : message.status === "sent" ? "✓" : "✓✓"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function DateDivider({ date }: { date: Date }) {
  return (
    <div className="flex items-center justify-center py-4">
      <span className="text-xs font-medium text-muted-foreground">
        {formatMessageDate(date)}
      </span>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-1 py-2">
      <div className="flex gap-1 rounded-2xl bg-muted px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
      </div>
    </div>
  );
}

export function ChatArea({
  user,
  messages,
  currentUserId,
  onSendMessage,
  onOpenContactInfo,
  isTyping,
  isLoading,
}: ChatAreaProps) {
  const [messageInput, setMessageInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (messageInput.trim() && onSendMessage) {
      onSendMessage(messageInput.trim());
      setMessageInput("");
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    const groups: { date: Date; messages: Message[] }[] = [];
    let currentDate: string | null = null;

    messages.forEach((message) => {
      const dateStr = message.timestamp.toDateString();
      if (dateStr !== currentDate) {
        groups.push({ date: message.timestamp, messages: [message] });
        currentDate = dateStr;
      } else {
        groups[groups.length - 1]?.messages.push(message);
      }
    });

    return groups;
  }, [messages]);

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-background">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Send className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Select a conversation</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose from your existing conversations or start a new one
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-1 flex-col bg-background">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <button
            onClick={onOpenContactInfo}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>
                {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{user.name}</h3>
              <p className={cn(
                "text-xs",
                user.isOnline ? "text-online" : "text-muted-foreground"
              )}>
                {user.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search in chat</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Phone className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voice call</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Video className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Video call</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onOpenContactInfo}>
                  Contact info
                </DropdownMenuItem>
                <DropdownMenuItem>Mute notifications</DropdownMenuItem>
                <DropdownMenuItem>Export chat</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Delete chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 px-6">
          <div className="py-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
              </div>
            ) : (
              <>
                {groupedMessages.map((group, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    <DateDivider date={group.date} />
                    <div className="flex flex-col gap-3">
                      {group.messages.map((message, messageIndex) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isSent={message.senderId === currentUserId}
                          showTimestamp={
                            messageIndex === group.messages.length - 1 ||
                            group.messages[messageIndex + 1]?.senderId !== message.senderId
                          }
                        />
                      ))}
                    </div>
                  </React.Fragment>
                ))}
                {isTyping && <TypingIndicator />}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Jump to bottom button (shown when scrolled up) */}
        <div className="pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2">
          {/* This would be shown conditionally when scrolled up */}
        </div>

        {/* Message Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              placeholder="Type any message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-11 flex-1"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0">
                  <Paperclip className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach file</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0">
                  <Smile className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Emoji</TooltipContent>
            </Tooltip>
            <Button
              onClick={handleSend}
              disabled={!messageInput.trim()}
              size="icon"
              className="h-11 w-11 shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
