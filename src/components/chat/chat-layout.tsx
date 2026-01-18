"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { IconSidebar } from "./icon-sidebar";
import { ConversationSidebar, type Conversation } from "./conversation-sidebar";
import { ChatArea, type Message, type ChatUser } from "./chat-area";
import { ContactInfoPanel } from "./contact-info-panel";
import { NewMessageDialog, type User } from "./new-message-dialog";
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
  const [activeNav, setActiveNav] = React.useState<"home" | "messages" | "files" | "settings">("messages");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isContactInfoOpen, setIsContactInfoOpen] = React.useState(false);
  const [isNewMessageOpen, setIsNewMessageOpen] = React.useState(false);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  const handleNavigation = (item: "home" | "messages" | "files" | "settings") => {
    setActiveNav(item);
    // TODO: Implement navigation to different sections
  };

  // Filter conversations based on search
  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) =>
      conv.user.name.toLowerCase().includes(query) ||
      conv.user.email.toLowerCase().includes(query) ||
      conv.lastMessage?.content.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Icon sidebar */}
      <IconSidebar
        activeItem={activeNav}
        onNavigate={handleNavigation}
        user={user}
        onLogout={handleLogout}
      />

      {/* Conversation sidebar */}
      <ConversationSidebar
        conversations={filteredConversations}
        selectedId={selectedConversation?.id}
        onSelect={onSelectConversation}
        onNewMessage={() => setIsNewMessageOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLoading={isLoadingConversations}
      />

      {/* Main chat area */}
      <ChatArea
        user={currentChatUser}
        messages={messages}
        currentUserId={user?.id ?? ""}
        onSendMessage={onSendMessage}
        onOpenContactInfo={() => setIsContactInfoOpen(true)}
        isTyping={isTyping}
        isLoading={isLoadingMessages}
      />

      {/* Contact info panel */}
      <ContactInfoPanel
        open={isContactInfoOpen}
        onClose={() => setIsContactInfoOpen(false)}
        user={currentChatUser}
        media={[]}
        links={[]}
        docs={[]}
      />

      {/* New message dialog */}
      <NewMessageDialog
        open={isNewMessageOpen}
        onClose={() => setIsNewMessageOpen(false)}
        users={allUsers.filter((u) => u.id !== user?.id)}
        onSelectUser={(selectedUser) => {
          onStartConversation?.(selectedUser);
        }}
        isLoading={isLoadingUsers}
      />
    </div>
  );
}
