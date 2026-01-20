"use client";

import * as React from "react";
import { useState, useRef, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
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

// Check icon for read messages (Mask implementation)
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

function MessageBubble({
  message,
  isSent,
  isLastInSequence,
  onReact,
  currentUserId,
}: {
  message: Message;
  isSent: boolean;
  isLastInSequence: boolean;
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
        "group relative flex w-full",
        isSent ? "justify-end" : "justify-start"
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
                  "w-8 h-8 flex items-center justify-center text-lg hover:bg-[#F3F3EE] hover:scale-125 transition-all rounded-full select-none",
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
          "relative max-w-[70%] px-3 py-3 transition-all",
          isSent
            ? "bg-[#F0FDF4] text-[#111625]"
            : "bg-white text-[#1C1C1C]",
          isSent
            ? isLastInSequence
              ? "rounded-[12px_12px_4px_12px]"
              : "rounded-[12px]"
            : isLastInSequence
              ? "rounded-[12px_12px_12px_4px]"
              : "rounded-[12px]"
        )}
      >
        <p className="text-xs leading-relaxed">
          {message.content}
        </p>

        {/* Reactions Display */}

        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div
            className={cn(
              "absolute -bottom-3 flex items-center justify-center p-[4px] bg-white rounded-[100px] z-10 gap-[10px] h-[20px] min-w-[20px]",
              isSent ? "left-[8px]" : "right-[8px]"
            )}
          >
            {Object.entries(message.reactions).map(([emoji, userIds]) => (
              <div
                key={emoji}
                className="flex items-center gap-0.5"
              >
                <span className="text-[12px] leading-4">{emoji}</span>
                {userIds.length > 1 && <span className="text-[9px] text-[#596881] font-medium leading-3">{userIds.length}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DateDivider({ date }: { date: Date }) {
  // Figma: width 65px height 28px (wrapper?). Inner elements.
  // We let the flex container handle width.
  return (
    <div className="flex items-center justify-center">
      <div
        className="flex items-center justify-center px-3 py-1 bg-white rounded-[60px] gap-[10px] h-[28px]"
      >
        <span className="text-[14px] font-medium leading-[20px] text-[#596881] tracking-[-0.006em]">
          {formatMessageDate(date)}
        </span>
      </div>
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

  // Group messages by Date, then by Sender Sequence
  const groupedContent = useMemo(() => {
    const content: React.ReactNode[] = [];
    let currentDate: string | null = null;
    let currentSequence: Message[] = [];

    const flushSequence = (keyPrefix: string) => {
      if (currentSequence.length === 0) return;

      const sequenceMessages = [...currentSequence];
      const isSent = sequenceMessages[0]!.senderId === currentUserId;
      const lastMsg = sequenceMessages[sequenceMessages.length - 1]!;

      content.push(
        // message-bubble-container
        <div key={`${keyPrefix}-seq`} className={cn("flex flex-col gap-1 w-full", isSent ? "items-end" : "items-start")}>
          {sequenceMessages.map((msg, idx) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isSent={isSent}
              isLastInSequence={idx === sequenceMessages.length - 1}
              onReact={(emoji) => handleReact(msg.id, emoji)}
              currentUserId={currentUserId}
            />
          ))}
          {/* Timestamp at the bottom of the sequence */}
          <div className={cn("flex items-center gap-[6px] pt-1", isSent ? "flex-row-reverse" : "flex-row")}>
            <span className="text-xs text-[#8B8B8B] leading-[16px]">
              {formatTime(lastMsg.timestamp)}
            </span>
            {isSent && (
              <ChecksIcon
                className={cn(
                  "w-[14px] h-[14px]",
                  lastMsg.status === "read" ? "bg-[#1E9A80]" : "bg-[#8B8B8B]"
                )}
              />
            )}
          </div>
        </div>
      );
      currentSequence = [];
    };

    messagesState.forEach((message, index) => {
      const dateStr = message.timestamp.toDateString();

      // New Date Group
      if (dateStr !== currentDate) {
        flushSequence(`seq-${index - 1}`);
        content.push(<DateDivider key={`date-${dateStr}`} date={message.timestamp} />);
        currentDate = dateStr;
      }

      // New Sender Sequence
      if (currentSequence.length > 0 && currentSequence[0]!.senderId !== message.senderId) {
        flushSequence(`seq-${index}`);
      }

      currentSequence.push(message);
    });

    // Flush last sequence
    flushSequence("seq-last");

    return content;
  }, [messagesState, currentUserId]);

  if (!user) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center bg-white rounded-[24px]"
      >
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F3EE]"
        >
          <img src="/icons/send.svg" className="h-8 w-8 opacity-50" alt="" />
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
        className="flex flex-1 flex-col min-h-0 bg-white rounded-[24px] p-3"
      >
        {/* Chat Header */}
        <div
          className="flex items-center shrink-0 pt-1 px-3 pb-4 gap-3 h-[60px]"
        >
          <button
            onClick={onOpenContactInfo}
            className="flex-1 flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0"
          >
            {/* Back Button (Mobile only) */}
            <div
              className="md:hidden mr-1 p-1 hover:bg-gray-100 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onBack?.();
              }}
            >
              <img src="/icons/chevron-right.svg" className="h-6 w-6 rotate-180" alt="Back" />
            </div>

            <Avatar className="w-10 h-10">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>
                {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start gap-1">
              <h3
                className="text-sm font-medium text-[#111625] leading-5 -tracking-[0.006em]"
              >
                {user.name}
              </h3>
              <p
                className={cn("text-xs font-medium leading-[16px]", user.isOnline ? "text-[#38C793]" : "text-[#8B8B8B]")}
              >
                {user.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </button>

          {/* Icon row */}
          <div className="flex items-center gap-3">
            <IconButton tooltip="Search in chat">
              <img src="/icons/search.svg" className="w-4 h-4" alt="Search" />
            </IconButton>
            <IconButton tooltip="Voice call">
              <img src="/icons/phone.svg" className="w-4 h-4" alt="Call" />
            </IconButton>
            <IconButton tooltip="Video call">
              <img src="/icons/video.svg" className="w-4 h-4" alt="Video" />
            </IconButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div>
                  <IconButton>
                    <img src="/icons/dots.svg" className="w-4 h-4" alt="More" />
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
                  <img src="/icons/user-circle.svg" className="w-5 h-5" alt="" />
                  <span className="text-sm font-medium text-[#262626]">Contact info</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] focus:text-[#262626] outline-none">
                  <div className="flex items-center gap-3">
                    <img src="/icons/volume-3.svg" className="w-5 h-5" alt="" />
                    <span className="text-sm font-medium text-[#262626]">Mute</span>
                  </div>
                  <img src="/icons/chevron-right.svg" className="w-4 h-4 text-[#8B8B8B]" alt="" />
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] focus:text-[#262626] outline-none"
                  onClick={onClearChat}
                >
                  <img src="/icons/x.svg" className="w-5 h-5" alt="" />
                  <span className="text-sm font-medium text-[#262626]">Clear chat</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#F3F3EE] focus:bg-[#F3F3EE] focus:text-[#262626] outline-none"
                  onClick={onExportChat}
                >
                  <img src="/icons/upload.svg" className="w-5 h-5" alt="" />
                  <span className="text-sm font-medium text-[#262626]">Export chat</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-red-50 focus:bg-red-50 outline-none"
                  onClick={onDeleteChat}
                >
                  <img src="/icons/trash.svg" className="w-5 h-5" alt="" />
                  <span className="text-sm font-medium text-[#E53935]">Delete chat</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages Content Area */}
        <div
          className="flex-1 flex flex-col overflow-hidden min-h-0 bg-[#F3F3EE] rounded-[16px] p-3"
        >
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto no-scrollbar flex flex-col"
          >
            <div className="flex flex-col mt-auto gap-3">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  {/* Loader using tailwind spinner */}
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E8E5DF] border-t-[#1E9A80]" />
                </div>
              ) : (
                <>
                  {groupedContent}
                  {isTyping && <TypingIndicator />}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="pt-2">
          <div
            className="flex items-center gap-1 border border-[#E8E5DF] rounded-[100px] p-[12px_4px_12px_16px] h-[40px]"
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
              className="flex-1 bg-transparent text-xs outline-none text-[#111625] placeholder:text-[#8796AF]"
            />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex cursor-pointer items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 transition-colors">
                    <img src="/icons/microphone.svg" className="w-[14px] h-[14px]" alt="Voice" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Voice message</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex cursor-pointer items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 transition-colors">
                    <img src="/icons/mood-happy.svg" className="w-[14px] h-[14px]" alt="Emoji" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Emoji</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex cursor-pointer items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 transition-colors">
                    <img src="/icons/paperclip.svg" className="w-[14px] h-[14px]" alt="Attach" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Attach file</TooltipContent>
              </Tooltip>

              <button
                onClick={handleSend}
                disabled={!messageInput.trim()}
                className="flex items-center justify-center disabled:opacity-50 w-[32px] h-[32px] bg-[#1E9A80] rounded-[100px] hover:bg-[#157A64] transition-colors"
              >
                <img src="/icons/send.svg" className="w-4 h-4 cursor-pointer brightness-0 invert" alt="Send" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
