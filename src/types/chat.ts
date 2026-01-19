/**
 * Base user interface used across the application
 */
export interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    isOnline: boolean;
}

/**
 * Extended user interface for chat context with additional fields
 */
export interface ChatUser extends User {
    lastSeen?: Date;
}

// ============================================
// Message Types
// ============================================

/**
 * Message delivery/read status
 */
export type MessageStatus = "sending" | "sent" | "delivered" | "read";

/**
 * Chat message interface
 */
export interface Message {
    id: string;
    content: string;
    timestamp: Date;
    senderId: string;
    status: MessageStatus;
    reactions?: Record<string, string[]>;
}

// ============================================
// Conversation Types
// ============================================

/**
 * Conversation with another user
 */
export interface Conversation {
    id: string;
    user: User;
    lastMessage?: {
        content: string;
        timestamp: Date;
        isRead: boolean;
        isSent: boolean;
    };
    unreadCount: number;
}

// ============================================
// Message List Display Types
// ============================================

/**
 * Simplified user for message list items
 */
export interface MessageItemUser {
    id: string;
    name: string;
    image?: string;
    isOnline?: boolean;
}

/**
 * Data for rendering a message list item (conversation preview)
 */
export interface MessageItemData {
    id: string;
    user: MessageItemUser;
    lastMessage: string;
    timestamp: string;
    isRead?: boolean;
    unreadCount?: number;
}

// ============================================
// Component Props Types
// ============================================

/**
 * Props for the main chat layout component
 */
export interface ChatLayoutProps {
    user?: User;
    conversations: Conversation[];
    selectedConversation?: Conversation;
    onSelectConversation?: (conversation: Conversation) => void;
    isLoadingConversations?: boolean;
    messages: Message[];
    onSendMessage?: (content: string) => void;
    onTyping?: () => void;
    isLoadingMessages?: boolean;
    isTyping?: boolean;
    allUsers: User[];
    onStartConversation?: (user: User) => void;
    isLoadingUsers?: boolean;
    onReact?: (messageId: string, emoji: string) => void;
    onLoadMoreUsers?: () => void;
    onSearchUsers?: (query: string) => void;
    onArchive?: (conversationId: string) => void;
    onUnarchive?: (conversationId: string) => void;
    onMute?: (conversationId: string) => void;
    onPin?: (conversationId: string) => void;
    onClearChat?: (conversationId: string) => void;
    onExportChat?: (conversationId: string) => void;
    onDeleteChat?: (conversationId: string) => void;
}

/**
 * Props for the chat area component
 */
export interface ChatAreaProps {
    user?: ChatUser;
    messages: Message[];
    currentUserId: string;
    onSendMessage?: (content: string) => void;
    onOpenContactInfo?: () => void;
    onReact?: (messageId: string, emoji: string) => void;
    onTyping?: () => void;
    isTyping?: boolean;
    isLoading?: boolean;
    onClearChat?: () => void;
    onExportChat?: () => void;
    onDeleteChat?: () => void;
}

/**
 * Props for swipeable message item component
 */
export interface SwipeableMessageItemProps {
    message: MessageItemData;
    isSelected?: boolean;
    onSelect?: () => void;
    onArchive?: () => void;
    onMarkUnread?: () => void;
    onMute?: () => void;
    onDelete?: () => void;
    onPin?: () => void;
    onContactInfo?: () => void;
    onExport?: () => void;
    onClear?: () => void;
}

/**
 * Props for initial user passed to ChatClient
 */
export interface ChatClientProps {
    initialUser: {
        id: string;
        name: string;
        email: string;
        image?: string;
        isOnline: boolean;
    };
}
