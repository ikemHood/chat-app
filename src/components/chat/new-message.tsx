"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchIcon } from "./swipeable-message-item";
import type { User } from "@/types";
export type { User } from "@/types";

interface NewMessagePopupProps {
  users: User[];
  onSelectUser: (user: User) => void;
  isLoading?: boolean;
  children: React.ReactNode;
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
      className="flex flex-row items-center p-1.5 w-full h-[44px] rounded-lg hover:bg-[#F3F3EE] transition-colors group"
      style={{
        // padding: "6px 8px",
        // gap: "10px"
      }}
    >
      {/* Profile */}
      <div className="flex flex-row items-center p-0 gap-2.5 w-max h-[32px]">
        {/* Avatar */}
        <div className="relative w-[32px] h-[32px]">
          <Avatar className="w-full h-full border-2 border-white">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback 
              className="bg-[#F7F9FB] text-[10px]"
            >
              {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {user.isOnline && (
            <div className="absolute right-0 bottom-0 w-2.5 h-2.5 bg-[#1E9A80] border border-white rounded-full"></div>
          )}
        </div>
        
        {/* Name */}
        <span className="h-[16px] font-medium text-[12px] leading-[16px] text-[#111625]">
          {user.name}
        </span>
      </div>
    </button>
  );
}

function UserSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2 h-[44px]">
      <div className="h-8 w-8 rounded-full bg-[#F3F3EE] animate-pulse" />
      <div className="h-4 w-24 rounded bg-[#F3F3EE] animate-pulse" />
    </div>
  );
}

export function NewMessagePopup({
  users,
  onSelectUser,
  isLoading,
  children
}: NewMessagePopupProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        side="bottom" 
        align="start"
        className="flex flex-col items-center p-3 gap-3 bg-white overflow-hidden"
        style={{
          width: "273px",
          maxHeight: "440px",
          border: "none",
          boxShadow: "0px 0px 24px rgba(0, 0, 0, 0.06)",
          borderRadius: "16px",
          padding: "12px"
        }}
      >
        {/* Member List Container */}
        <div className="flex flex-col items-start p-0 gap-4 w-full h-full min-h-0">
          {/* Title */}
          <div className="flex flex-row items-center p-0 gap-2.5 w-full h-[24px]">
            <span className="w-full h-[24px] font-medium text-[16px] leading-[24px] tracking-[-0.011em] text-[#111625]">
              New Message
            </span>
          </div>

          {/* Search Form */}
          <div 
            className="flex flex-row items-center p-2.5 gap-2 w-full h-[32px] bg-white border border-[#F3F3EE] rounded-[10px]"
            style={{ padding: "10px 4px 10px 10px" }}
          >
            <SearchIcon className="w-[14px] h-[14px] text-[#8B8B8B]" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none min-w-0 font-normal text-[12px] leading-[16px] text-[#111625] placeholder-[#8B8B8B]"
            />
          </div>

          {/* List */}
          <div className="flex-1 w-full overflow-y-auto min-h-0">
             <div className="flex flex-col items-start p-0 gap-1.5 w-full">
              {isLoading ? (
                <>
                  <UserSkeleton />
                  <UserSkeleton />
                  <UserSkeleton />
                </>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center w-full">
                  <p className="font-medium text-[12px] text-[#8B8B8B]">No users found</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <UserItem
                    key={user.id}
                    user={user}
                    onClick={() => {
                      onSelectUser(user);
                      setOpen(false);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
