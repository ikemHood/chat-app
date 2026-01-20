"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { SwipeableMessageItemProps } from "@/types";
import { SWIPE_THRESHOLD, ACTION_WIDTH } from "@/constants";

// Double check icon for read status
function ChecksIcon({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        maskImage: "url(/icons/checks.svg)",
        WebkitMaskImage: "url(/icons/checks.svg)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

export function SwipeableMessageItem({
  message,
  isSelected,
  onSelect,
  onArchive,
  onMarkUnread,
  onMute,
  onDelete,
  onPin: _onPin,
  onContactInfo,
  onExport,
  onClear,
}: SwipeableMessageItemProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine which action to show
  const showArchive = swipeX < -SWIPE_THRESHOLD / 2;
  const showUnread = swipeX > SWIPE_THRESHOLD / 2;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0]?.clientX ?? 0);
    setIsDragging(true);

    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      // Trigger context menu via right-click simulation
      if (containerRef.current) {
        const event = new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          clientX: e.touches[0]?.clientX ?? 0,
          clientY: e.touches[0]?.clientY ?? 0,
        });
        containerRef.current.dispatchEvent(event);
      }
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    // Cancel long press if user is swiping
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const currentX = e.touches[0]?.clientX ?? 0;
    const diff = currentX - startX;

    // Limit swipe distance
    const clampedDiff = Math.max(-ACTION_WIDTH - 8, Math.min(ACTION_WIDTH + 8, diff));
    setSwipeX(clampedDiff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Snap to action or reset
    if (swipeX < -SWIPE_THRESHOLD) {
      // Trigger archive
      onArchive?.();
      setSwipeX(0);
    } else if (swipeX > SWIPE_THRESHOLD) {
      // Trigger unread
      onMarkUnread?.();
      setSwipeX(0);
    } else {
      // Reset position
      setSwipeX(0);
    }

    setIsLongPress(false);
  };

  // Mouse events for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const diff = e.clientX - startX;
    const clampedDiff = Math.max(-ACTION_WIDTH - 8, Math.min(ACTION_WIDTH + 8, diff));
    setSwipeX(clampedDiff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    if (swipeX < -SWIPE_THRESHOLD) {
      onArchive?.();
    } else if (swipeX > SWIPE_THRESHOLD) {
      onMarkUnread?.();
    }

    setSwipeX(0);
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setSwipeX(0);
      setIsDragging(false);
    }
  };

  const handleClick = () => {
    if (Math.abs(swipeX) < 5 && !isLongPress) {
      onSelect?.();
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={containerRef}
          className="relative overflow-hidden select-none h-[64px] rounded-[12px]"
          onMouseLeave={handleMouseLeave}
        >
          {/* Left action - Unread (revealed when swiping right) */}
          <div
            className="absolute left-0 top-0 h-full flex items-center justify-center transition-opacity bg-[#1E9A80] rounded-[12px]"
            style={{
              width: `${ACTION_WIDTH}px`,
              opacity: showUnread ? 1 : 0,
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <img src="/icons/message-circle.svg" alt="Unread" className="w-[18px] h-[18px] brightness-0 invert" />
              <span
                className="text-white font-medium text-[12px] leading-[16px]"
              >
                Unread
              </span>
            </div>
          </div>

          {/* Right action - Archive (revealed when swiping left) */}
          <div
            className="absolute right-0 top-0 h-full flex items-center justify-center transition-opacity bg-[#1E9A80] rounded-[12px]"
            style={{
              width: `${ACTION_WIDTH}px`,
              opacity: showArchive ? 1 : 0,
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <img src="/icons/archive.svg" alt="Archive" className="w-[18px] h-[18px] brightness-0 invert" />
              <span
                className="text-white font-medium text-[12px] leading-[16px]"
              >
                Archive
              </span>
            </div>
          </div>

          {/* Main item content */}
          <div
            className={cn(
              "absolute top-0 left-0 w-full h-full flex items-center gap-3 cursor-pointer transition-transform p-3 rounded-[12px]",
              isDragging ? "" : "transition-all duration-200",
              (isSelected || showArchive || showUnread) ? "bg-[#F3F3EE]" : "bg-transparent"
            )}
            style={{
              transform: `translateX(${swipeX}px)`,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleClick}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="w-[40px] h-[40px]">
                <AvatarImage src={message.user.image} alt={message.user.name} />
                <AvatarFallback
                  className="text-sm bg-[#F7F9FB]"
                >
                  {message.user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {message.user.isOnline && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white w-[12px] h-[12px] bg-[#1E9A80]"
                />
              )}
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              {/* Name and time row */}
              <div className="flex items-center justify-between gap-1">
                <span
                  className="truncate font-medium text-[14px] leading-[20px] tracking-[-0.006em] text-[#1C1C1C]"
                >
                  {message.user.name}
                </span>
                <span
                  className="shrink-0 font-normal text-[12px] leading-[16px] text-[#8B8B8B]"
                >
                  {message.timestamp}
                </span>
              </div>

              {/* Message and status row */}
              <div className="flex items-center justify-between gap-4">
                <span
                  className="truncate flex-1 font-normal text-[12px] leading-[16px] text-[#8B8B8B]"
                >
                  {message.lastMessage}
                </span>
                {message.unreadCount ? (
                  <div
                    className="shrink-0 flex items-center justify-center rounded-full min-w-[20px] h-[20px] px-[6px] bg-[#1E9A80] font-medium text-[11px] text-white"
                  >
                    {message.unreadCount}
                  </div>
                ) : (
                  <ChecksIcon
                    className={cn("shrink-0 w-4 h-4", message.isRead ? "bg-[#1E9A80]" : "bg-[#8B8B8B]")}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>

      {/* Context menu for long press / right click */}
      <ContextMenuContent
        className="w-[200px] p-2 bg-white rounded-[16px] shadow-[0px_0px_24px_rgba(0,0,0,0.06)] border border-[#E8E5DF] flex flex-col gap-1"
      >
        <ContextMenuItem
          onClick={onMarkUnread}
          className="flex flex-row items-center gap-[10px] px-2 py-1.5 h-8 rounded-[8px] cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] text-[#111625] focus:text-[#111625]"
        >
          <img src="/icons/message-circle.svg" alt="Mark as unread" className="w-4 h-4" />
          <span className="font-inter font-medium text-[14px] leading-[20px] tracking-[-0.006em]">Mark as unread</span>
        </ContextMenuItem>

        <ContextMenuItem
          onClick={onArchive}
          className="flex flex-row items-center gap-[10px] px-2 py-1.5 h-8 rounded-[8px] cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] text-[#111625] focus:text-[#111625]"
        >
          <img src="/icons/archive.svg" alt="Archive" className="w-4 h-4" />
          <span className="font-inter font-medium text-[14px] leading-[20px] tracking-[-0.006em]">Archive</span>
        </ContextMenuItem>

        <ContextMenuItem
          onClick={onMute}
          className="flex flex-row items-center justify-between px-2 py-1.5 h-8 rounded-[8px] cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] text-[#111625] focus:text-[#111625]"
        >
          <div className="flex items-center gap-[10px]">
            <img src="/icons/volume-3.svg" alt="Mute" className="w-4 h-4" />
            <span className="font-inter font-medium text-[14px] leading-[20px] tracking-[-0.006em]">Mute</span>
          </div>
          <img src="/icons/chevron-right.svg" alt="" className="w-4 h-4" />
        </ContextMenuItem>

        <ContextMenuItem
          onClick={onContactInfo}
          className="flex flex-row items-center gap-[10px] px-2 py-1.5 h-8 rounded-[8px] cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] text-[#111625] focus:text-[#111625]"
        >
          <img src="/icons/user-circle.svg" alt="Contact info" className="w-4 h-4" />
          <span className="font-inter font-medium text-[14px] leading-[20px] tracking-[-0.006em]">Contact info</span>
        </ContextMenuItem>

        <ContextMenuItem
          onClick={onExport}
          className="flex flex-row items-center gap-[10px] px-2 py-1.5 h-8 rounded-[8px] cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] text-[#111625] focus:text-[#111625]"
        >
          <img src="/icons/upload.svg" alt="Export chat" className="w-4 h-4" />
          <span className="font-inter font-medium text-[14px] leading-[20px] tracking-[-0.006em]">Export chat</span>
        </ContextMenuItem>

        <ContextMenuItem
          onClick={onClear}
          className="flex flex-row items-center gap-[10px] px-2 py-1.5 h-8 rounded-[8px] cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] text-[#111625] focus:text-[#111625]"
        >
          <img src="/icons/x.svg" alt="Clear chat" className="w-4 h-4" />
          <span className="font-inter font-medium text-[14px] leading-[20px] tracking-[-0.006em]">Clear chat</span>
        </ContextMenuItem>

        <ContextMenuItem
          onClick={onDelete}
          className="flex flex-row items-center gap-[10px] px-2 py-1.5 h-8 rounded-[8px] cursor-pointer hover:bg-red-50 focus:bg-red-50 text-[#DF1C41] focus:text-[#DF1C41]"
        >
          <img src="/icons/trash.svg" alt="Delete chat" className="w-4 h-4" />
          <span className="font-inter font-medium text-[14px] leading-[20px] tracking-[-0.006em]">Delete chat</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}


