"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    isOnline: boolean;
  };
  lastMessage?: {
    content: string;
    timestamp: Date;
    isRead: boolean;
    isSent: boolean;
  };
  unreadCount: number;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect?: (conversation: Conversation) => void;
  onNewMessage?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isLoading?: boolean;
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes} mins ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors",
        isSelected
          ? "bg-[#F0FDF4]"
          : "hover:bg-[#F7F9FB]"
      )}
    >
      {/* Avatar with online indicator */}
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.user.image} alt={conversation.user.name} />
          <AvatarFallback>
            {conversation.user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {conversation.user.isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#1E9A80]" />
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium text-[#111625]">
            {conversation.user.name}
          </span>
          {conversation.lastMessage && (
            <span className="shrink-0 text-xs text-[#8796AF]">
              {formatTimestamp(conversation.lastMessage.timestamp)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="truncate text-sm text-[#596881]">
            {conversation.lastMessage?.content ?? "No messages yet"}
          </p>
          {conversation.unreadCount > 0 && (
            <Badge variant="default" className="h-5 min-w-5 shrink-0 rounded-full px-1.5 text-[10px] font-semibold bg-[#1E9A80]">
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </Badge>
          )}
          {conversation.lastMessage?.isRead && conversation.lastMessage?.isSent && (
            <span className="shrink-0 text-xs text-[#1E9A80]">✓✓</span>
          )}
        </div>
      </div>
    </button>
  );
}

function ConversationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        <div className="h-3 w-48 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}

export function ConversationSidebar({
  conversations,
  selectedId,
  onSelect,
  onNewMessage,
  searchQuery = "",
  onSearchChange,
  isLoading,
}: ConversationSidebarProps) {
  return (
    <div className="flex h-full w-80 flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8E5DF] px-6 py-4">
        <h2 className="text-lg font-semibold text-[#111625]">All Message</h2>
        <Button size="sm" onClick={onNewMessage} className="gap-1.5 bg-[#1E9A80]">
          <Plus className="h-4 w-4" />
          New Message
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 border-b border-[#E8E5DF] px-6 py-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8796AF]" />
          <input
            type="text"
            placeholder="Search in message"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="h-9 w-full rounded-lg border pl-9 text-sm outline-none border-[#E8E5DF] text-[#111625] bg-white"
          />
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
          <Filter className="h-4 w-4 text-[#596881]" />
        </Button>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <>
              <ConversationSkeleton />
              <ConversationSkeleton />
              <ConversationSkeleton />
              <ConversationSkeleton />
            </>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No conversations</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Start a new message to begin chatting
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedId === conversation.id}
                onClick={() => onSelect?.(conversation)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
