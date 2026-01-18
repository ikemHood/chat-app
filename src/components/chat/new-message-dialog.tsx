"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  isOnline: boolean;
}

interface NewMessageDialogProps {
  open: boolean;
  onClose: () => void;
  users: User[];
  onSelectUser: (user: User) => void;
  isLoading?: boolean;
}

function UserItem({
  user,
  onClick,
}: {
  user: User;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors"
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback>
            {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {user.isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-online" />
        )}
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium text-foreground">{user.name}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
    </button>
  );
}

function UserSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        <div className="h-3 w-48 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}

export function NewMessageDialog({
  open,
  onClose,
  users,
  onSelectUser,
  isLoading,
}: NewMessageDialogProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
        </div>

        {/* User list */}
        <ScrollArea className="max-h-[400px]">
          <div className="px-2 pb-4">
            {isLoading ? (
              <>
                <UserSkeleton />
                <UserSkeleton />
                <UserSkeleton />
                <UserSkeleton />
              </>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No users found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a different search term
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <UserItem
                  key={user.id}
                  user={user}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
