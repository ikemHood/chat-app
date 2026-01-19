"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  SwipeableMessageItem, 
  SearchIcon, 
  FilterIcon, 
  PencilPlusIcon,
} from "./swipeable-message-item";
import { NewMessagePopup } from "./new-message";
import type { MessageItemData, User } from "@/types";

interface MessageListProps {
  messages: MessageItemData[];
  selectedId?: string;
  onSelect?: (message: MessageItemData) => void;
  // New Message Props
  users?: User[];
  onSelectUser?: (user: User) => void;
  isUsersLoading?: boolean;
  
  onArchive?: (id: string) => void;
  onMarkUnread?: (id: string) => void;
  onMute?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  onContactInfo?: (id: string) => void;
  onExport?: (id: string) => void;
  onClear?: (id: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isLoading?: boolean;
}

export function MessageList({
  messages,
  selectedId,
  onSelect,
  users = [],
  onSelectUser,
  isUsersLoading,
  onArchive,
  onMarkUnread,
  onMute,
  onDelete,
  onPin,
  onContactInfo,
  onExport,
  onClear,
  searchQuery = "",
  onSearchChange,
  isLoading,
}: MessageListProps) {
  return (
    <div 
      className="flex flex-col h-full"
      style={{
        width: "400px",
        padding: "24px",
        gap: "24px",
        background: "#FFFFFF",
        borderRadius: "24px"
      }}
    >
      {/* Title row */}
      <div 
        className="flex items-center justify-between"
        style={{
          height: "32px",
          gap: "8px"
        }}
      >
        <h2 
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "20px",
            lineHeight: "30px",
            color: "#111625",
            margin: 0
          }}
        >
          All Message
        </h2>
        
        {/* New Message button */}
        <NewMessagePopup
          users={users}
          onSelectUser={(user) => onSelectUser?.(user)}
          isLoading={isUsersLoading}
        >
          <button
            className="flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              padding: "8px",
              gap: "6px",
              height: "32px",
              background: "linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 100%), #1E9A80",
              border: "1px solid #1E9A80",
              boxShadow: "inset 0px 1px 0px 1px rgba(255, 255, 255, 0.12)",
              borderRadius: "8px"
            }}
          >
            <PencilPlusIcon className="w-[18px] h-[18px] text-white" />
            <span 
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                textAlign: "center",
                letterSpacing: "-0.006em",
                color: "#FFFFFF"
              }}
            >
              New Message
            </span>
          </button>
        </NewMessagePopup>
      </div>

      {/* Search and filter row */}
      <div 
        className="flex items-center"
        style={{
          height: "40px",
          gap: "16px"
        }}
      >
        {/* Search form */}
        <div 
          className="flex items-center flex-1"
          style={{
            padding: "10px 5px 10px 10px",
            gap: "8px",
            height: "40px",
            border: "1px solid #E8E5DF",
            borderRadius: "10px"
          }}
        >
          <SearchIcon className="w-4 h-4 shrink-0" style={{ color: "#262626" }} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="flex-1 bg-transparent outline-none min-w-0"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.006em",
              color: "#404040"
            }}
          />
        </div>

        {/* Filter button */}
        <button
          className="flex items-center justify-center shrink-0"
          style={{
            width: "40px",
            height: "40px",
            background: "#FFFFFF",
            border: "1px solid #E8E5DF",
            borderRadius: "10px"
          }}
        >
          <FilterIcon className="w-[18px] h-[18px]" style={{ color: "#262626" }} />
        </button>
      </div>

      {/* Messages list */}
      <ScrollArea className="flex-1 -mx-3 px-3">
        <div 
          className="flex flex-col"
          style={{ gap: "8px" }}
        >
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i}
                className="animate-pulse"
                style={{
                  height: "64px",
                  background: "#F3F3EE",
                  borderRadius: "12px"
                }}
              />
            ))
          ) : messages.length === 0 ? (
            <div 
              className="flex flex-col items-center justify-center py-12"
              style={{ color: "#8B8B8B" }}
            >
              <p>No messages found</p>
            </div>
          ) : (
            messages.map((message) => (
              <SwipeableMessageItem
                key={message.id}
                message={message}
                isSelected={selectedId === message.id}
                onSelect={() => onSelect?.(message)}
                onArchive={() => onArchive?.(message.id)}
                onMarkUnread={() => onMarkUnread?.(message.id)}
                onMute={() => onMute?.(message.id)}
                onDelete={() => onDelete?.(message.id)}
                onPin={() => onPin?.(message.id)}
                onContactInfo={() => onContactInfo?.(message.id)}
                onExport={() => onExport?.(message.id)}
                onClear={() => onClear?.(message.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
