"use client";

import * as React from "react";
import { useState, useRef, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Search, Phone, Video, MoreHorizontal, Smile, Paperclip, Send, Mic, ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Message, ChatAreaProps } from "@/types";
import { REACTION_OPTIONS } from "@/constants";

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

// Check icon for read messages
function ChecksIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.5 4.08337L5.25 9.33337L2.625 6.70837M12.25 4.08337L7 9.33337M4.375 6.70837L9.625 1.45837"
        stroke="currentColor"
        strokeWidth="1.17"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessageBubble({
  message,
  isSent,
  showTimestamp = true,
  isLastInGroup = false,
  onReact,
  currentUserId,
}: {
  message: Message;
  isSent: boolean;
  showTimestamp?: boolean;
  isLastInGroup?: boolean;
  onReact?: (emoji: string) => void;
  currentUserId: string;
}) {
  const [showReactions, setShowReactions] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Derive userReaction
  const userReaction = useMemo(() => {
    if (!message.reactions) return undefined;
    for (const [emoji, userIds] of Object.entries(message.reactions)) {
      if (userIds.includes(currentUserId)) return emoji;
    }
    return undefined;
  }, [message.reactions, currentUserId]);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowReactions(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowReactions(true);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-1 group relative",
        isSent ? "items-end" : "items-start"
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
    >
      {/* Reaction Picker Popup */}
      {showReactions && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowReactions(false)}
          />
          <div
            className={cn(
              "absolute bottom-full mb-2 z-50 flex items-center gap-1 p-1 bg-white rounded-full shadow-lg border border-[#E8E5DF] animate-in fade-in zoom-in duration-200",
              isSent ? "right-0" : "left-0"
            )}
          >
            {REACTION_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact?.(emoji);
                  setShowReactions(false);
                }}
                className={cn(
                  //message.userReaction === emoji && "bg-[#F3F3EE]"
                  // userReaction is now derived, but we need to check if we use the prop or the local variable.
                  // The variable `userReaction` is defined above.
                  // So replace accessing message.userReaction with userReaction
                  "w-8 h-8 flex items-center justify-center text-lg hover:bg-[#F3F3EE] hover:scale-125 transition-all rounded-full select-none",
                  //message.userReaction === emoji && "bg-[#F3F3EE]"
                  userReaction === emoji && "bg-[#F3F3EE]"
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}

      <div
        className={cn(
          "max-w-[70%] px-3 py-3 relative transition-all",
          isSent
            ? "items-end bg-[#F0FDF4]"
            : "items-start bg-white",
          isSent
            ? isLastInGroup
              ? "rounded-[12px_12px_4px_12px]"
              : "rounded-[12px]"
            : isLastInGroup
              ? "rounded-[12px_12px_12px_4px]"
              : "rounded-[12px]"
        )}
      >
        <p
          className={cn("text-xs leading-relaxed", isSent ? "text-[#111625]" : "text-[#1C1C1C]")}
        >
          {message.content}
        </p>

        {/* Reactions Display */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div
            className={cn(
              "absolute -bottom-2.5 flex items-center justify-center p-0.5 bg-white border border-[#E8E5DF] rounded-full shadow-sm z-10",
              isSent ? "left-3" : "right-3"
            )}
          >
            {Object.entries(message.reactions).map(([emoji, userIds]) => (
              <div
                key={emoji}
                className="flex items-center gap-0.5 px-1"
              >
                <span className="text-[10px] leading-3">{emoji}</span>
                {userIds.length > 1 && <span className="text-[9px] text-[#596881] font-medium leading-3">{userIds.length}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {showTimestamp && (
        <div className={cn(
          "flex items-center gap-1.5 pt-1",
          isSent ? "flex-row-reverse" : "flex-row"
        )}>
          <span
            className="text-xs text-[#8B8B8B]"
          >
            {formatTime(message.timestamp)}
          </span>
          {isSent && (
            <ChecksIcon
              className={cn(
                "h-3.5 w-3.5",
                message.status === "read" ? "text-[#1E9A80]" : "text-[#8B8B8B]"
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}

function DateDivider({ date }: { date: Date }) {
  return (
    <div className="flex items-center justify-center py-4">
      <span
        className="px-3 py-1 text-sm font-medium rounded-full bg-white text-[#596881]"
      >
        {formatMessageDate(date)}
      </span>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-1 py-2">
      <div
        className="flex gap-1 rounded-xl px-4 py-3 bg-white"
      >
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#8B8B8B] [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#8B8B8B] [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#8B8B8B]" />
      </div>
    </div>
  );
}

// Icon button component for header
function IconButton({
  children,
  onClick,
  tooltip
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tooltip?: string;
}) {
  const button = (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-[32px] h-[32px] bg-white border border-[#E8E5DF] rounded-[8px]"
    >
      {children}
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

export function ChatArea({
  user,
  messages,
  currentUserId,
  onSendMessage,
  onReact,
  onOpenContactInfo,
  onTyping,
  isTyping,
  isLoading,
  onClearChat,
  onExportChat,
  onDeleteChat,
  onBack,
}: ChatAreaProps) {
  const [messageInput, setMessageInput] = useState("");
  const [messagesState, setMessagesState] = useState(messages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state with props
  useEffect(() => {
    setMessagesState(messages);
  }, [messages]);

  // Handle local reaction update
  const handleReact = (messageId: string, emoji: string) => {
    // Call parent handler
    onReact?.(messageId, emoji);

    // Optimistic update
    setMessagesState((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const reactions = { ...(msg.reactions ?? {}) };
          const userIds = reactions[emoji] ?? [];

          if (userIds.includes(currentUserId)) {
            // Remove
            reactions[emoji] = userIds.filter(id => id !== currentUserId);
            if (reactions[emoji].length === 0) delete reactions[emoji];
          } else {
            // Add
            reactions[emoji] = [...userIds, currentUserId];
          }

          return {
            ...msg,
            reactions,
          };
        }
        return msg;
      })
    );
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messagesState, isTyping]);

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
  const groupedMessages = useMemo(() => {
    const groups: { date: Date; messages: Message[] }[] = [];
    let currentDate: string | null = null;

    messagesState.forEach((message) => {
      const dateStr = message.timestamp.toDateString();
      if (dateStr !== currentDate) {
        groups.push({ date: message.timestamp, messages: [message] });
        currentDate = dateStr;
      } else {
        groups[groups.length - 1]?.messages.push(message);
      }
    });

    return groups;
  }, [messagesState]);

  if (!user) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center bg-white rounded-[24px]"
      >
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F3EE]"
        >
          <Send className="h-8 w-8 text-[#8B8B8B]" />
        </div>
        <h3 className="text-lg font-semibold text-[#111625]">Select a conversation</h3>
        <p className="mt-1 text-sm text-[#596881]">
          Choose from your existing conversations or start a new one
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className="flex flex-1 flex-col min-h-0 bg-white rounded-[24px] p-[12px]"
      >
        {/* Chat Header */}
        <div
          className="flex items-center justify-between shrink-0 p-[4px_12px_16px] gap-[12px]"
        >
          <button
            onClick={onOpenContactInfo}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            {/* Back Button (Mobile only) */}
            <div
              className="md:hidden mr-1 p-1 hover:bg-gray-100 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onBack?.();
              }}
            >
              <ChevronLeft className="h-6 w-6 text-[#111625]" />
            </div>

            <Avatar className="w-[40px] h-[40px]">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>
                {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <h3
                className="text-sm font-medium text-[#111625] "
              >
                {user.name}
              </h3>
              <p
                className={cn("text-xs font-medium", user.isOnline ? "text-[#38C793]" : "text-[#8B8B8B]")}
              >
                {user.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </button>

          {/* Icon row */}
          <div className="flex items-center gap-3">
            <IconButton tooltip="Search in chat">
              <Search className="h-4 w-4 text-[#262626]" />
            </IconButton>
            <IconButton tooltip="Voice call">
              <Phone className="h-4 w-4 text-[#262626]" />
            </IconButton>
            <IconButton tooltip="Video call">
              <Video className="h-4 w-4 text-[#262626]" />
            </IconButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div>
                  <IconButton>
                    <MoreHorizontal className="h-4 w-4 text-[#262626]" />
                  </IconButton>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 p-2 bg-white rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.12)] border-none"
              >
                <DropdownMenuItem
                  onClick={onOpenContactInfo}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] focus:text-[#262626] outline-none"
                >
                  <svg className="w-5 h-5 text-[#262626]" viewBox="0 0 20 20" fill="none">
                    <path d="M10 12.5C12.0711 12.5 13.75 10.8211 13.75 8.75C13.75 6.67893 12.0711 5 10 5C7.92893 5 6.25 6.67893 6.25 8.75C6.25 10.8211 7.92893 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 12.5C6.54822 12.5 3.75 15.2982 3.75 18.75H16.25C16.25 15.2982 13.4518 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm font-medium text-[#262626]">Contact info</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] focus:text-[#262626] outline-none">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#262626]" viewBox="0 0 20 20" fill="none">
                      <path d="M16.25 7.5V10M16.25 10V12.5M16.25 10H18.75M16.25 10H13.75M8.75 12.5C10.8211 12.5 12.5 10.8211 12.5 8.75C12.5 6.67893 10.8211 5 8.75 5C6.67893 5 5 6.67893 5 8.75C5 10.8211 6.67893 12.5 8.75 12.5ZM8.75 12.5C5.98858 12.5 3.75 14.7386 3.75 17.5H13.75C13.75 14.7386 11.5114 12.5 8.75 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm font-medium text-[#262626]">Mute</span>
                  </div>
                  <svg className="w-4 h-4 text-[#8B8B8B]" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] focus:text-[#262626] outline-none"
                  onClick={onClearChat}
                >
                  <svg className="w-5 h-5 text-[#262626]" viewBox="0 0 20 20" fill="none">
                    <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm font-medium text-[#262626]">Clear chat</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] focus:text-[#262626] outline-none"
                  onClick={onExportChat}
                >
                  <svg className="w-5 h-5 text-[#262626]" viewBox="0 0 20 20" fill="none">
                    <path d="M6.25 17.5H13.75C14.4404 17.5 15 16.9404 15 16.25V7.5L10 2.5H6.25C5.55964 2.5 5 3.05964 5 3.75V16.25C5 16.9404 5.55964 17.5 6.25 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 2.5V7.5H15M7.5 11.25L10 8.75L12.5 11.25M10 8.75V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm font-medium text-[#262626]">Export chat</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-red-50 focus:bg-red-50 outline-none"
                  onClick={onDeleteChat}
                >
                  <svg className="w-5 h-5 text-[#E53935]" viewBox="0 0 20 20" fill="none">
                    <path d="M3.75 5H16.25M7.5 5V3.75C7.5 3.05964 8.05964 2.5 8.75 2.5H11.25C11.9404 2.5 12.5 3.05964 12.5 3.75V5M15 5V16.25C15 16.9404 14.4404 17.5 13.75 17.5H6.25C5.55964 17.5 5 16.9404 5 16.25V5H15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm font-medium text-[#E53935]">Delete chat</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages Content Area */}
        <div
          className="flex-1 flex flex-col overflow-hidden min-h-0 bg-[#F3F3EE] rounded-[16px] p-[12px]"
        >
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto no-scrollbar flex flex-col"
          >
            <div className="flex flex-col mt-auto pt-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E8E5DF] border-t-[#1E9A80]" />
                </div>
              ) : (
                <>
                  {groupedMessages.map((group, groupIndex) => (
                    <React.Fragment key={groupIndex}>
                      <DateDivider date={group.date} />
                      <div className="flex flex-col gap-1">
                        {group.messages.map((message, messageIndex) => {
                          const isSent = message.senderId === currentUserId;
                          const isLastInGroup =
                            messageIndex === group.messages.length - 1 ||
                            group.messages[messageIndex + 1]?.senderId !== message.senderId;

                          return (
                            <MessageBubble
                              key={message.id}
                              message={message}
                              isSent={isSent}
                              isLastInGroup={isLastInGroup}
                              showTimestamp={isLastInGroup}
                              onReact={(emoji) => handleReact(message.id, emoji)}
                              currentUserId={currentUserId}
                            />
                          );
                        })}
                      </div>
                    </React.Fragment>
                  ))}
                  {isTyping && <TypingIndicator />}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="pt-2">
          <div
            className="flex items-center border border-[#E8E5DF] rounded-[100px] p-[12px_4px_12px_16px]"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Type any message..."
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                onTyping?.();
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-xs outline-none text-[#111625]"
            />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center justify-center w-6 h-6 rounded-full">
                    <Mic className="h-3.5 w-3.5 text-[#262626]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Voice message</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center justify-center w-6 h-6 rounded-full">
                    <Smile className="h-3.5 w-3.5 text-[#262626]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Emoji</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center justify-center w-6 h-6 rounded-full">
                    <Paperclip className="h-3.5 w-3.5 text-[#262626]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Attach file</TooltipContent>
              </Tooltip>

              <button
                onClick={handleSend}
                disabled={!messageInput.trim()}
                className="flex items-center justify-center disabled:opacity-50 w-[32px] h-[32px] bg-[#1E9A80] rounded-[100px]"
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
