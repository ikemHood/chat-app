"use client";

import * as React from "react";
import { ChatLayout, type Conversation, type Message, type User } from "@/components/chat";

// Demo data for previewing the UI
const demoUser = {
  id: "current-user",
  name: "You",
  email: "you@example.com",
  image: undefined,
};

const demoUsers: User[] = [
  { id: "1", name: "Adrian Kurt", email: "adrian@example.com", isOnline: true },
  { id: "2", name: "Bianca Lofre", email: "bianca@example.com", isOnline: true },
  { id: "3", name: "Diana Sayu", email: "diana@example.com", isOnline: false },
  { id: "4", name: "Palmer Dian", email: "palmer@example.com", isOnline: true },
  { id: "5", name: "Sam Kohler", email: "sam@example.com", isOnline: false },
  { id: "6", name: "Yuki Tanaka", email: "yuki@example.com", isOnline: true },
  { id: "7", name: "Zender Lowre", email: "zender@example.com", isOnline: false },
  { id: "8", name: "Daniel CH", email: "daniel@example.com", isOnline: true },
];

const demoConversations: Conversation[] = [
  {
    id: "conv-1",
    user: { ...demoUsers[0]!, isOnline: true },
    lastMessage: {
      content: "Thanks for the explanation!",
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      isRead: true,
      isSent: false,
    },
    unreadCount: 0,
  },
  {
    id: "conv-2",
    user: { ...demoUsers[1]!, isOnline: true },
    lastMessage: {
      content: "Let's do a quick call after lunch, I'll expla...",
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      isRead: true,
      isSent: true,
    },
    unreadCount: 0,
  },
  {
    id: "conv-3",
    user: { ...demoUsers[7]!, isOnline: true },
    lastMessage: {
      content: "anytime! my pleasure~",
      timestamp: new Date(Date.now() - 32 * 60 * 1000),
      isRead: false,
      isSent: false,
    },
    unreadCount: 2,
  },
  {
    id: "conv-4",
    user: { ...demoUsers[6]!, isOnline: false },
    lastMessage: {
      content: "Okay cool, that make sense 👍",
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      isRead: true,
      isSent: false,
    },
    unreadCount: 0,
  },
  {
    id: "conv-5",
    user: { ...demoUsers[3]!, isOnline: true },
    lastMessage: {
      content: "Thanks, Jones! That helps 🙏",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isRead: true,
      isSent: true,
    },
    unreadCount: 0,
  },
  {
    id: "conv-6",
    user: { ...demoUsers[5]!, isOnline: true },
    lastMessage: {
      content: "Have you watch the new season of Damn...",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      isRead: true,
      isSent: false,
    },
    unreadCount: 0,
  },
];

const demoMessages: Message[] = [
  {
    id: "msg-1",
    content: "Hey, Joejon",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    senderId: "8",
    status: "read",
  },
  {
    id: "msg-2",
    content: "Can you help with with the last task for Eventora, please?",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 10000),
    senderId: "8",
    status: "read",
  },
  {
    id: "msg-3",
    content: "I'm little bit confused with the task. 😅",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 20000),
    senderId: "8",
    status: "read",
  },
  {
    id: "msg-4",
    content: "It's done already, no worries!",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    senderId: "current-user",
    status: "read",
  },
  {
    id: "msg-5",
    content: "what...",
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    senderId: "8",
    status: "read",
  },
  {
    id: "msg-6",
    content: "Really?! Thank you so much! 😍",
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000 + 5000),
    senderId: "8",
    status: "read",
  },
  {
    id: "msg-7",
    content: "anytime! my pleasure~",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    senderId: "current-user",
    status: "read",
  },
];

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation | undefined>(
    demoConversations.find((c) => c.id === "conv-3")
  );
  const [messages, setMessages] = React.useState<Message[]>(demoMessages);
  const [isTyping, setIsTyping] = React.useState(false);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      timestamp: new Date(),
      senderId: "current-user",
      status: "sending",
    };
    setMessages((prev) => [...prev, newMessage]);

    // Simulate message being sent
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMessage.id ? { ...m, status: "sent" } : m
        )
      );
    }, 500);

    // Simulate read receipt
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMessage.id ? { ...m, status: "read" } : m
        )
      );
    }, 1500);

    // Simulate typing and response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const responseMessage: Message = {
          id: `msg-${Date.now()}`,
          content: "Got it! Thanks for the update 👍",
          timestamp: new Date(),
          senderId: selectedConversation?.user.id ?? "8",
          status: "read",
        };
        setMessages((prev) => [...prev, responseMessage]);
      }, 2000);
    }, 3000);
  };

  const handleStartConversation = (user: User) => {
    // Check if conversation already exists
    const existingConv = demoConversations.find((c) => c.user.id === user.id);
    if (existingConv) {
      setSelectedConversation(existingConv);
      setMessages([]); // Clear messages for now
    } else {
      // Create new conversation
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        user: { ...user, isOnline: user.isOnline },
        unreadCount: 0,
      };
      setSelectedConversation(newConv);
      setMessages([]);
    }
  };

  return (
    <ChatLayout
      user={demoUser}
      conversations={demoConversations}
      selectedConversation={selectedConversation}
      onSelectConversation={(conv) => {
        setSelectedConversation(conv);
        // In real app, fetch messages for this conversation
        if (conv.id === "conv-3") {
          setMessages(demoMessages);
        } else {
          setMessages([]);
        }
      }}
      messages={messages}
      onSendMessage={handleSendMessage}
      isTyping={isTyping}
      allUsers={demoUsers}
      onStartConversation={handleStartConversation}
    />
  );
}
