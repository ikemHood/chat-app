"use client";

import * as React from "react";
import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { ChatLayout } from "./chat-layout";
import { api } from "@/trpc/react";
import { authClient } from "@/server/better-auth/client";
import type {
  Conversation,
  Message,
  User,
  ChatClientProps,
  WsChatPayload,
  WsTypingPayload,
  WsStatusPayload,
  WsDeliveredPayload,
  WsReadReceiptPayload,
  WsChatAckPayload,
  WsReactionPayload,
  WsMessage,
} from "@/types";

// Notification sound (lazy loaded)
let notificationSound: HTMLAudioElement | null = null;
function playNotificationSound() {
  if (typeof window === "undefined") return;
  if (!notificationSound) {
    notificationSound = new Audio("/notification.mp3");
    notificationSound.volume = 0.5;
  }
  notificationSound.play().catch(() => {
    // Ignore autoplay restrictions
  });
}

export function ChatClient({ initialUser }: ChatClientProps) {
  // ---/ State /---
  const [selectedConversation, setSelectedConversation] = useState<Conversation | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [peerTyping, setPeerTyping] = useState<Record<string, boolean>>({});
  const [userStatuses, setUserStatuses] = useState<Record<string, boolean>>({});
  
  // Typing indicator debounce
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSent = useRef<number>(0);

  // ---/ Queries /---
  
  // 1. Get Conversations
  const { data: conversationsData, isLoading: isLoadingConversations, refetch: refetchConversations } = 
    api.chat.getConversations.useQuery(undefined, {
      refetchInterval: 10000, // Poll every 10s as backup
    });
    
  // Format conversations with live status updates
  const conversations: Conversation[] = useMemo(() => {
    if (!conversationsData) return [];
    return conversationsData.map(c => ({
      id: c.id,
      user: {
        id: c.user.id,
        name: c.user.name,
        email: c.user.email,
        image: c.user.image ?? undefined,
        isOnline: userStatuses[c.user.id] ?? c.user.isOnline,
      },
      lastMessage: c.lastMessage ? {
        content: c.lastMessage.content,
        timestamp: c.lastMessage.createdAt,
        isRead: c.lastMessage.read,
        isSent: c.lastMessage.senderId === initialUser.id,
      } : undefined,
      unreadCount: c.unreadCount,
    }));
  }, [conversationsData, initialUser.id, userStatuses]);

  // 2. Get All Users for new message popup
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const { data: allUsersData, isLoading: isLoadingUsers, fetchNextPage, hasNextPage } = 
    api.user.getAllUsers.useInfiniteQuery(
      { limit: 20, search: userSearchQuery || undefined },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );
  
  const allUsers: User[] = useMemo(() => {
    return allUsersData?.pages.flatMap(page => 
      page.users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image ?? undefined,
        isOnline: userStatuses[u.id] ?? u.isOnline,
      }))
    ) ?? [];
  }, [allUsersData, userStatuses]);

  // 3. Get Messages for selected conversation
  const { data: messagesData, isLoading: isLoadingMessages, refetch: refetchMessages } = 
    api.chat.getMessages.useQuery(
      { peerId: selectedConversation?.user.id ?? "" },
      { 
        enabled: !!selectedConversation,
        refetchInterval: false, // Rely on WebSocket
      }
    );
  
  // Format messages
  useEffect(() => {
    if (messagesData) {
      const formatted: Message[] = messagesData.messages.map(m => ({
        id: m.id,
        content: m.content,
        timestamp: m.createdAt,
        senderId: m.senderId,
        status: m.read ? "read" : m.delivered ? "delivered" : "sent",
        reactions: m.reactions as Record<string, string[]> | undefined,
      }));
      setMessages(formatted);
    }
  }, [messagesData]);

  // ---/ Mutations /---
  const markReadMutation = api.chat.markRead.useMutation();
  const toggleReactionMutation = api.chat.toggleReaction.useMutation();
  const archiveMutation = api.chat.archiveConversation.useMutation({
    onSuccess: () => void refetchConversations(),
  });
  const togglePinMutation = api.chat.togglePin.useMutation({
    onSuccess: () => void refetchConversations(),
  });
  const toggleMuteMutation = api.chat.toggleMute.useMutation({
    onSuccess: () => void refetchConversations(),
  });
  
  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (selectedConversation && messages.some(m => m.senderId !== initialUser.id && m.status !== "read")) {
      markReadMutation.mutate({ peerId: selectedConversation.user.id });
    }
  }, [selectedConversation, messages, initialUser.id, markReadMutation]);

  // ---/ WebSocket /---
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connectWebSocket = useCallback(async () => {
    // Get session for authentication
    const session = await authClient.getSession();
    if (!session?.data?.session) {
      console.error("[WS] No session found, cannot connect");
      // Retry after delay
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      reconnectAttempts.current++;
      reconnectTimeoutRef.current = setTimeout(() => void connectWebSocket(), delay);
      return;
    }

    // WebSocket server runs on port 3001
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost = window.location.hostname;
    // Pass session token as query parameter for cross-port auth
    const wsUrl = `${protocol}//${wsHost}:3001/ws?token=${encodeURIComponent(session.data.session.token)}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("[WS] Connected");
      reconnectAttempts.current = 0;
    };
    
    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as WsMessage;
        
        switch (data.type) {
          case "CHAT": {
            const msg = data.payload;
            
            // If message is for/from current conversation, add it
            if (selectedConversation && 
                (msg.senderId === selectedConversation.user.id || 
                 msg.receiverId === selectedConversation.user.id)) {
              setMessages(prev => {
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, {
                  id: msg.id,
                  content: msg.content,
                  timestamp: new Date(msg.createdAt),
                  senderId: msg.senderId,
                  status: msg.read ? "read" : msg.delivered ? "delivered" : "sent",
                }];
              });
              
              // If incoming message and we're viewing, mark read
              if (msg.senderId !== initialUser.id) {
                markReadMutation.mutate({ peerId: msg.senderId });
                ws.send(JSON.stringify({ type: "READ", payload: { peerId: msg.senderId } }));
              }
            }
            
            // Play sound for incoming messages not in current view
            if (msg.senderId !== initialUser.id && msg.senderId !== selectedConversation?.user.id) {
              playNotificationSound();
            }
            
            void refetchConversations();
            break;
          }
          
          case "CHAT_ACK": {
            const { tempId, message: savedMsg } = data.payload;
            // Replace temp message with saved one
            setMessages(prev => prev.map(m => 
              m.id === tempId ? {
                ...m,
                id: savedMsg.id,
                status: "sent",
              } : m
            ));
            break;
          }
          
          case "TYPING": {
            const { userId, isTyping } = data.payload;
            setPeerTyping(prev => ({ ...prev, [userId]: isTyping }));
            break;
          }
          
          case "STATUS": {
            const { userId, isOnline } = data.payload;
            setUserStatuses(prev => ({ ...prev, [userId]: isOnline }));
            break;
          }
          
          case "DELIVERED": {
            // Update message status
            setMessages(prev => prev.map(m => ({
              ...m,
              status: m.status === "sending" || m.status === "sent" ? "delivered" : m.status,
            })));
            break;
          }
          
          case "READ_RECEIPT": {
            // Update message status
            setMessages(prev => prev.map(m => ({
              ...m,
              status: m.senderId === initialUser.id ? "read" : m.status,
            })));
            break;
          }
          
          case "REACTION": {
            const { messageId, userId, emoji, action } = data.payload;
            setMessages(prev => prev.map(m => {
              if (m.id !== messageId) return m;
              const reactions = { ...(m.reactions ?? {}) };
              const userIds = reactions[emoji] ?? [];
              
              if (action === "add" && !userIds.includes(userId)) {
                reactions[emoji] = [...userIds, userId];
              } else if (action === "remove") {
                reactions[emoji] = userIds.filter(id => id !== userId);
                if (reactions[emoji].length === 0) delete reactions[emoji];
              }
              
              return { ...m, reactions };
            }));
            break;
          }
        }
      } catch (e) {
        console.error("[WS] Parse error:", e);
      }
    };
    
    ws.onclose = () => {
      console.log("[WS] Disconnected");
      // Exponential backoff reconnect
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      reconnectAttempts.current++;
      reconnectTimeoutRef.current = setTimeout(() => void connectWebSocket(), delay);
    };
    
    ws.onerror = (error) => {
      console.error("[WS] Error:", error);
    };
    
    wsRef.current = ws;
  }, [selectedConversation, initialUser.id, refetchConversations, markReadMutation]);

  useEffect(() => {
    void connectWebSocket();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connectWebSocket]);

  // ---/ Handlers /---
  
  const handleSendMessage = (content: string) => {
    if (!selectedConversation || !wsRef.current) return;
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      content,
      timestamp: new Date(),
      senderId: initialUser.id,
      status: "sending",
    };
    setMessages(prev => [...prev, optimisticMsg]);
    
    // Send via WebSocket (which saves to DB)
    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "CHAT",
        payload: {
          receiverId: selectedConversation.user.id,
          content,
          tempId,
        }
      }));
    }
  };

  const handleTyping = useCallback(() => {
    if (!selectedConversation || !wsRef.current) return;
    
    const now = Date.now();
    // Debounce: only send typing indicator every 300ms
    if (now - lastTypingSent.current < 300) return;
    lastTypingSent.current = now;
    
    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "TYPING",
        payload: {
          receiverId: selectedConversation.user.id,
          isTyping: true,
        }
      }));
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Send "stopped typing" after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN && selectedConversation) {
        wsRef.current.send(JSON.stringify({
          type: "TYPING",
          payload: {
            receiverId: selectedConversation.user.id,
            isTyping: false,
          }
        }));
      }
    }, 2000);
  }, [selectedConversation]);
  
  const handleStartConversation = (user: User) => {
    // Check if we have it in list
    const existing = conversations.find(c => c.user.id === user.id);
    if (existing) {
      setSelectedConversation(existing);
    } else {
      // Create temporary conversation object
      setSelectedConversation({
        id: user.id,
        user: user,
        unreadCount: 0,
      });
      setMessages([]);
    }
  };

  const handleReact = (messageId: string, emoji: string) => {
    toggleReactionMutation.mutate({ messageId, emoji });
  };

  const handleArchive = (conversationId: string) => {
    archiveMutation.mutate({ conversationId });
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(undefined);
    }
  };

  const handlePin = (conversationId: string) => {
    togglePinMutation.mutate({ conversationId });
  };

  const handleMute = (conversationId: string) => {
    toggleMuteMutation.mutate({ conversationId });
  };

  // Is current peer typing?
  const isTyping = selectedConversation ? peerTyping[selectedConversation.user.id] ?? false : false;

  return (
    <ChatLayout
      user={initialUser}
      conversations={conversations}
      selectedConversation={selectedConversation}
      onSelectConversation={setSelectedConversation}
      isLoadingConversations={isLoadingConversations}
      messages={messages}
      onSendMessage={handleSendMessage}
      onTyping={handleTyping}
      onReact={handleReact}
      isLoadingMessages={isLoadingMessages}
      isTyping={isTyping}
      allUsers={allUsers}
      onStartConversation={handleStartConversation}
      isLoadingUsers={isLoadingUsers}
      onLoadMoreUsers={hasNextPage ? () => fetchNextPage() : undefined}
      onSearchUsers={setUserSearchQuery}
      onArchive={handleArchive}
      onMute={handleMute}
      onPin={handlePin}
    />
  );
}
