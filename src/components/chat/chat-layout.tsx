"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { IconSidebar } from "./icon-sidebar";
import { MessageList } from "./message-list";
import { type MessageItemData } from "./swipeable-message-item";
import { type Conversation } from "./conversation-sidebar";
import { ChatArea, type Message, type ChatUser } from "./chat-area";
import { ContactInfoPanel } from "./contact-info-panel";
import { type User } from "./new-message";
import { TopBar } from "./top-bar";
import { authClient } from "@/server/better-auth/client";

interface ChatLayoutProps {
  // User session
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  // Conversations
  conversations: Conversation[];
  selectedConversation?: Conversation;
  onSelectConversation?: (conversation: Conversation) => void;
  isLoadingConversations?: boolean;
  // Messages
  messages: Message[];
  onSendMessage?: (content: string) => void;
  isLoadingMessages?: boolean;
  isTyping?: boolean;
  // Users for new message
  allUsers: User[];
  onStartConversation?: (user: User) => void;
  isLoadingUsers?: boolean;
}

export function ChatLayout({
  user,
  conversations,
  selectedConversation,
  onSelectConversation,
  isLoadingConversations,
  messages,
  onSendMessage,
  isLoadingMessages,
  isTyping,
  allUsers,
  onStartConversation,
  isLoadingUsers,
}: ChatLayoutProps) {
  const router = useRouter();
  const [activeNav, setActiveNav] = React.useState<"home" | "messages" | "compass" | "folder" | "images">("messages");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isContactInfoOpen, setIsContactInfoOpen] = React.useState(false);


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
  const messageItems: MessageItemData[] = React.useMemo(() => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations]);

  // Filter messages based on search
  const filteredMessages = React.useMemo(() => {
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
    <div className="relative flex h-screen w-full overflow-hidden" style={{ background: "#F3F3EE" }}>
      {/* Icon sidebar */}
      <IconSidebar
        activeItem={activeNav}
        onNavigate={handleNavigation}
        user={user}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Top bar */}
        <TopBar
          user={user}
          onSearch={(query) => setSearchQuery(query)}
          onNotifications={() => {}}
          onSettings={() => {}}
          onProfile={() => {}}
        />

        {/* Content area with message list and chat */}
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Message list - swipeable items */}
          <div className="shrink-0 overflow-hidden">
            <MessageList
              messages={filteredMessages}
              selectedId={selectedConversation?.id}
              onSelect={handleMessageSelect}
              users={allUsers.filter((u) => u.id !== user?.id)}
              onSelectUser={(selectedUser) => {
                onStartConversation?.(selectedUser);
              }}
              isUsersLoading={isLoadingUsers}
              onArchive={(id) => console.log("Archive:", id)}
              onMarkUnread={(id) => console.log("Mark unread:", id)}
              onMute={(id) => console.log("Mute:", id)}
              onDelete={(id) => console.log("Delete:", id)}
              onPin={(id) => console.log("Pin:", id)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isLoading={isLoadingConversations}
            />
          </div>

          {/* Main chat area - separate rounded container */}
          <ChatArea
            user={currentChatUser}
            messages={messages}
            currentUserId={user?.id ?? ""}
            onSendMessage={onSendMessage}
            onOpenContactInfo={() => setIsContactInfoOpen(true)}
            onReact={(messageId, emoji) => console.log("React:", messageId, emoji)}
            isTyping={isTyping}
            isLoading={isLoadingMessages}
          />
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

