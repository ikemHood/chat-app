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

// Archive icon
function ArchiveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M15.75 6V15C15.75 15.1989 15.671 15.3897 15.5303 15.5303C15.3897 15.671 15.1989 15.75 15 15.75H3C2.80109 15.75 2.61032 15.671 2.46967 15.5303C2.32902 15.3897 2.25 15.1989 2.25 15V6M7.5 9H10.5M1.5 3H16.5V6H1.5V3Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Unread/Message icon
function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M15.75 9C15.7522 9.99 15.5397 10.9678 15.129 11.865C14.6427 12.9579 13.8867 13.9062 12.9373 14.6199C11.9878 15.3337 10.8772 15.789 9.71752 15.9375C8.71999 16.0106 7.72269 15.8411 6.795 15.4425L1.5 17.25L3.30749 11.955C2.87249 11.0273 2.64173 10.0199 2.70001 9.01125C2.84851 7.85159 3.30384 6.74101 4.01764 5.79157C4.73143 4.84214 5.67973 4.08611 6.77249 3.6C7.66969 3.18954 8.64749 2.97694 9.6375 2.98125H10.05C11.7893 3.08018 13.4379 3.81531 14.6863 5.06361C15.9346 6.31191 16.6697 7.96058 16.7688 9.6V9.5625L15.75 9Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Double check icon for read status
function ChecksIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M10.5 4.5L5.25 9.75L3 7.5M13.5 4.5L8.25 9.75L7.5 9" 
        stroke="currentColor" 
        strokeWidth="1.33" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Pencil icon for new message button
function PencilPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M6.75 15H3C2.80109 15 2.61032 14.921 2.46967 14.7803C2.32902 14.6397 2.25 14.4489 2.25 14.25V10.8107C2.25 10.7121 2.2694 10.6145 2.30709 10.5234C2.34478 10.4322 2.40003 10.3494 2.46967 10.2803L10.2197 2.53033C10.3603 2.38968 10.5511 2.31066 10.75 2.31066C10.9489 2.31066 11.1397 2.38968 11.2803 2.53033L14.7197 5.96967C14.8603 6.11032 14.9393 6.30109 14.9393 6.5C14.9393 6.69891 14.8603 6.88968 14.7197 7.03033L6.96967 14.7803C6.90003 14.85 6.81775 14.9052 6.72665 14.9429C6.63555 14.9806 6.53793 15 6.43934 15H6.75ZM8.25 4.5L12.75 9M12.75 12.75V15.75M11.25 14.25H14.25" 
        stroke="currentColor" 
        strokeWidth="1.3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Search icon
function SearchIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M7.25 12.5C10.1495 12.5 12.5 10.1495 12.5 7.25C12.5 4.35051 10.1495 2 7.25 2C4.35051 2 2 4.35051 2 7.25C2 10.1495 4.35051 12.5 7.25 12.5Z" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M11 11L14 14" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Filter icon
function FilterIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M3 3H15L10.5 8.84V13.5L7.5 15V8.84L3 3Z" 
        stroke="currentColor" 
        strokeWidth="1.3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
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
  onPin,
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
          className="relative overflow-hidden select-none"
          style={{ 
            height: "64px",
            borderRadius: "12px"
          }}
          onMouseLeave={handleMouseLeave}
        >
          {/* Left action - Unread (revealed when swiping right) */}
          <div 
            className="absolute left-0 top-0 h-full flex items-center justify-center transition-opacity"
            style={{
              width: `${ACTION_WIDTH}px`,
              background: "#1E9A80",
              borderRadius: "12px",
              opacity: showUnread ? 1 : 0,
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <MessageIcon className="w-[18px] h-[18px] text-white" />
              <span 
                className="text-white"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "12px",
                  lineHeight: "16px"
                }}
              >
                Unread
              </span>
            </div>
          </div>

          {/* Right action - Archive (revealed when swiping left) */}
          <div 
            className="absolute right-0 top-0 h-full flex items-center justify-center transition-opacity"
            style={{
              width: `${ACTION_WIDTH}px`,
              background: "#1E9A80",
              borderRadius: "12px",
              opacity: showArchive ? 1 : 0,
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <ArchiveIcon className="w-[18px] h-[18px] text-white" />
              <span 
                className="text-white"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "12px",
                  lineHeight: "16px"
                }}
              >
                Archive
              </span>
            </div>
          </div>

          {/* Main item content */}
          <div
            className={cn(
              "absolute top-0 left-0 w-full h-full flex items-center gap-3 cursor-pointer transition-transform",
              isDragging ? "" : "transition-all duration-200"
            )}
            style={{
              padding: "12px",
              background: isSelected || showArchive || showUnread ? "#F3F3EE" : "transparent",
              borderRadius: "12px",
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
              <Avatar style={{ width: "40px", height: "40px" }}>
                <AvatarImage src={message.user.image} alt={message.user.name} />
                <AvatarFallback 
                  className="text-sm"
                  style={{ background: "#F7F9FB" }}
                >
                  {message.user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {message.user.isOnline && (
                <div 
                  className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white"
                  style={{
                    width: "12px",
                    height: "12px",
                    background: "#1E9A80"
                  }}
                />
              )}
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              {/* Name and time row */}
              <div className="flex items-center justify-between gap-1">
                <span 
                  className="truncate"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "20px",
                    letterSpacing: "-0.006em",
                    color: "#111625"
                  }}
                >
                  {message.user.name}
                </span>
                <span 
                  className="shrink-0"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: "16px",
                    color: "#8B8B8B"
                  }}
                >
                  {message.timestamp}
                </span>
              </div>

              {/* Message and status row */}
              <div className="flex items-center justify-between gap-4">
                <span 
                  className="truncate flex-1"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: "16px",
                    color: "#8B8B8B"
                  }}
                >
                  {message.lastMessage}
                </span>
                {message.unreadCount ? (
                  <div 
                    className="shrink-0 flex items-center justify-center rounded-full"
                    style={{
                      minWidth: "20px",
                      height: "20px",
                      padding: "0 6px",
                      background: "#1E9A80",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "11px",
                      color: "#FFFFFF"
                    }}
                  >
                    {message.unreadCount}
                  </div>
                ) : (
                  <ChecksIcon 
                    className="shrink-0 w-4 h-4"
                    style={{ color: message.isRead ? "#1E9A80" : "#8B8B8B" }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>

      {/* Context menu for long press / right click */}
      <ContextMenuContent 
        className="w-56 p-2"
        style={{
          background: "#FFFFFF",
          borderRadius: "12px",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.12)",
          border: "none"
        }}
      >
        <ContextMenuItem 
          onClick={onMarkUnread}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] focus:text-[#262626]"
        >
          <MessageIcon className="w-5 h-5 text-[#262626]" />
          <span className="text-sm font-medium text-[#262626]">Mark as unread</span>
        </ContextMenuItem>
        
        <ContextMenuItem 
          onClick={onArchive}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] focus:text-[#262626]"
        >
          <ArchiveIcon className="w-5 h-5 text-[#262626]" />
          <span className="text-sm font-medium text-[#262626]">Archive</span>
        </ContextMenuItem>
        
        <ContextMenuItem 
          onClick={onMute}
          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] focus:text-[#262626]"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-[#262626]" viewBox="0 0 20 20" fill="none">
              <path d="M16.25 7.5V10M16.25 10V12.5M16.25 10H18.75M16.25 10H13.75M8.75 12.5C10.8211 12.5 12.5 10.8211 12.5 8.75C12.5 6.67893 10.8211 5 8.75 5C6.67893 5 5 6.67893 5 8.75C5 10.8211 6.67893 12.5 8.75 12.5ZM8.75 12.5C5.98858 12.5 3.75 14.7386 3.75 17.5H13.75C13.75 14.7386 11.5114 12.5 8.75 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-medium text-[#262626]">Mute</span>
          </div>
          <svg className="w-4 h-4 text-[#8B8B8B]" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ContextMenuItem>
        
        <ContextMenuItem 
          onClick={onContactInfo}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] focus:text-[#262626]"
        >
          <svg className="w-5 h-5 text-[#262626]" viewBox="0 0 20 20" fill="none">
            <path d="M10 12.5C12.0711 12.5 13.75 10.8211 13.75 8.75C13.75 6.67893 12.0711 5 10 5C7.92893 5 6.25 6.67893 6.25 8.75C6.25 10.8211 7.92893 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 12.5C6.54822 12.5 3.75 15.2982 3.75 18.75H16.25C16.25 15.2982 13.4518 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-medium text-[#262626]">Contact info</span>
        </ContextMenuItem>
        
        <ContextMenuItem 
          onClick={onExport}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] focus:text-[#262626]"
        >
          <svg className="w-5 h-5 text-[#262626]" viewBox="0 0 20 20" fill="none">
            <path d="M6.25 17.5H13.75C14.4404 17.5 15 16.9404 15 16.25V7.5L10 2.5H6.25C5.55964 2.5 5 3.05964 5 3.75V16.25C5 16.9404 5.55964 17.5 6.25 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 2.5V7.5H15M7.5 11.25L10 8.75L12.5 11.25M10 8.75V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-medium text-[#262626]">Export chat</span>
        </ContextMenuItem>
        
        <ContextMenuItem 
          onClick={onClear}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] focus:text-[#262626]"
        >
          <svg className="w-5 h-5 text-[#262626]" viewBox="0 0 20 20" fill="none">
            <path d="M5 5L15 15M5 15L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-medium text-[#262626]">Clear chat</span>
        </ContextMenuItem>
        
        <ContextMenuItem 
          onClick={onDelete}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-red-50 focus:bg-red-50"
        >
          <svg className="w-5 h-5 text-[#E53935]" viewBox="0 0 20 20" fill="none">
            <path d="M3.75 5H16.25M7.5 5V3.75C7.5 3.05964 8.05964 2.5 8.75 2.5H11.25C11.9404 2.5 12.5 3.05964 12.5 3.75V5M15 5V16.25C15 16.9404 14.4404 17.5 13.75 17.5H6.25C5.55964 17.5 5 16.9404 5 16.25V5H15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-medium text-[#E53935]">Delete chat</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

// Export icons for use in message list
export { SearchIcon, FilterIcon, PencilPlusIcon };
