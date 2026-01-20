"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SwipeableMessageItem,
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
      className="flex flex-col h-full w-[400px] p-[24px] gap-[24px] bg-white rounded-[24px]"
    >
      {/* Title row */}
      <div
        className="flex items-center justify-between h-[32px] gap-[8px]"
      >
        <h2
          className="font-semibold text-[20px] leading-[30px] text-[#111625] m-0"
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
            className="flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity p-[8px] gap-[6px] h-[32px] border-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_100%),#1E9A80] border bg-[#1E9A80] shadow-[inset_0px_1px_0px_1px_rgba(255,255,255,0.12)] rounded-[8px] w-[134px]"
          >
            <img src="/icons/pencil-plus.svg" alt="New Message" className="w-[18px] h-[18px] brightness-0 invert" />
            <span
              className="font-medium text-[14px] leading-[20px] text-center text-white tracking-[-0.006em]"
            >
              New Message
            </span>
          </button>
        </NewMessagePopup>
      </div>

      {/* Search and filter row */}
      <div
        className="flex items-center h-[40px] gap-[16px]"
      >
        {/* Search form */}
        <div
          className="flex items-center flex-1 p-[10px_5px_10px_10px] gap-[8px] h-[40px] border border-[#E8E5DF] rounded-[10px]"
        >
          <img src="/icons/search.svg" alt="Search" className="w-[16px] h-[16px]" />
          <input
            type="text"
            placeholder="Search in message"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="flex-1 bg-transparent outline-none min-w-0 font-normal text-[14px] leading-[20px] text-[#404040] tracking-[-0.006em]"
          />
        </div>

        {/* Filter button */}
        <button
          className="flex items-center justify-center shrink-0 w-[40px] h-[40px] bg-white border border-[#E8E5DF] rounded-[10px]"
        >
          <img src="/icons/filter.svg" alt="Filter" className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Messages list */}
      <ScrollArea className="flex-1 -mx-3 px-3">
        <div
          className="flex flex-col gap-[8px]"
        >
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse h-[64px] bg-[#F3F3EE] rounded-[12px]"
              />
            ))
          ) : messages.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 text-[#8B8B8B]"
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
