"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { IconSidebar } from "./icon-sidebar";
import { MessageList } from "./message-list";
import { type MessageItemData } from "@/types";
import { ChatArea } from "./chat-area";
import { ContactInfoPanel } from "./contact-info-panel";
import { TopBar } from "./top-bar";
import { authClient } from "@/server/better-auth/client";
import type {
  ChatLayoutProps,
  ChatUser,
} from "@/types";

export function ChatLayout({
  user,
  conversations,
  selectedConversation,
  onSelectConversation,
  isLoadingConversations,
  messages,
  onSendMessage,
  onTyping,
  isLoadingMessages,
  isTyping,
  allUsers,
  onStartConversation,
  isLoadingUsers,
  onReact,
  onLoadMoreUsers: _onLoadMoreUsers,
  onSearchUsers: _onSearchUsers,
  onArchive,
  onUnarchive: _onUnarchive,
  onMute,
  onPin,
  onClearChat,
  onExportChat,
  onDeleteChat,
}: ChatLayoutProps) {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState<"home" | "messages" | "compass" | "folder" | "images">("messages");
  const [searchQuery, setSearchQuery] = useState("");
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);


  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  const handleNavigation = (item: "home" | "messages" | "compass" | "folder" | "images") => {
    setActiveNav(item);
    // TODO: Implement navigation to different sections
  };

  // Format relative time helper
  const formatRelativeTime = (date: Date): string => {
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
  };

  // Convert conversations to MessageItemData format for the new MessageList
  const messageItems: MessageItemData[] = useMemo(() => {
    return conversations.map((conv) => ({
      id: conv.id,
      user: {
        id: conv.user.id,
        name: conv.user.name,
        image: conv.user.image,
        isOnline: conv.user.isOnline,
      },
      lastMessage: conv.lastMessage?.content ?? "",
      timestamp: conv.lastMessage?.timestamp 
        ? formatRelativeTime(conv.lastMessage.timestamp)
        : "",
      isRead: conv.lastMessage?.isRead ?? false,
      unreadCount: conv.unreadCount,
    }));
  }, [conversations]);

  // Filter messages based on search
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messageItems;
    const query = searchQuery.toLowerCase();
    return messageItems.filter((item) =>
      item.user.name.toLowerCase().includes(query) ||
      item.lastMessage.toLowerCase().includes(query)
    );
  }, [messageItems, searchQuery]);

  // Current chat user from selected conversation
  const currentChatUser: ChatUser | undefined = selectedConversation
    ? {
        id: selectedConversation.user.id,
        name: selectedConversation.user.name,
        email: selectedConversation.user.email,
        image: selectedConversation.user.image,
        isOnline: selectedConversation.user.isOnline,
      }
    : undefined;

  // Handle message item selection
  const handleMessageSelect = (item: MessageItemData) => {
    const conv = conversations.find(c => c.id === item.id);
    if (conv && onSelectConversation) {
      onSelectConversation(conv);
    }
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#F3F3EE]">
      {/* Icon sidebar */}
      <IconSidebar
        activeItem={activeNav}
        onNavigate={handleNavigation}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col gap-3 p-3">
        {/* Top bar */}
        <TopBar
          user={user}
          onSearch={(query) => setSearchQuery(query)}
          onNotifications={undefined}
          onSettings={undefined}
          onProfile={undefined}
        />

        {/* Content area with message list and chat */}
        <div className="flex flex-1 gap-3 overflow-hidden">
          {/* Message list - swipeable items */}
          <div className={cn(
            "shrink-0 overflow-hidden w-full md:w-auto md:block",
             selectedConversation ? "hidden" : "block"
          )}>
            <MessageList
              messages={filteredMessages}
              selectedId={selectedConversation?.id}
              onSelect={handleMessageSelect}
              users={allUsers.filter((u) => u.id !== user?.id)}
              onSelectUser={(selectedUser) => {
                onStartConversation?.(selectedUser);
              }}
              isUsersLoading={isLoadingUsers}
              onArchive={(id) => onArchive?.(id)}
              onMarkUnread={(id) => console.log("Mark unread:", id)}
              onMute={(id) => onMute?.(id)}
              onDelete={(id) => onDeleteChat?.(id)}
              onPin={(id) => onPin?.(id)}
              onContactInfo={() => setIsContactInfoOpen(true)}
              onExport={(id) => onExportChat?.(id)}
              onClear={(id) => onClearChat?.(id)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isLoading={isLoadingConversations}
            />
          </div>

          {/* Main chat area - separate rounded container */}
          <div className={cn(
            "flex-1 flex flex-col min-w-0 w-full md:w-auto md:flex",
            selectedConversation ? "flex" : "hidden"
          )}>
            <ChatArea
              onBack={() => onSelectConversation?.(undefined)}
              user={currentChatUser}
              messages={messages}
              currentUserId={user?.id ?? ""}
              onSendMessage={onSendMessage}
              onOpenContactInfo={() => setIsContactInfoOpen(true)}
              onReact={onReact}
              onTyping={onTyping}
              isTyping={isTyping}
              isLoading={isLoadingMessages}
              onClearChat={selectedConversation ? () => onClearChat?.(selectedConversation.id) : undefined}
              onExportChat={selectedConversation ? () => onExportChat?.(selectedConversation.id) : undefined}
              onDeleteChat={selectedConversation ? () => onDeleteChat?.(selectedConversation.id) : undefined}
            />
          </div>
        </div>
      </div>

      {/* Contact info panel */}
      <ContactInfoPanel
        open={isContactInfoOpen}
        onClose={() => setIsContactInfoOpen(false)}
        user={currentChatUser}
        media={[]}
        links={[]}
        docs={[]}
      />
    </div>
  );
}

