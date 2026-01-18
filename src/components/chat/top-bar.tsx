"use client";

import * as React from "react";
import { Search, Bell, Settings, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


// Message icon for the header
function MessageCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M17.5 9.58333C17.5028 10.6833 17.2663 11.7697 16.81 12.7667C16.2697 13.9531 15.4297 14.968 14.3747 15.7166C13.3197 16.4651 12.0857 16.9228 10.7972 17.0417C9.68889 17.1008 8.58078 16.9101 7.55 16.4833L2 18.5L4.01667 12.95C3.58833 11.9192 3.40192 10.8111 3.46944 9.70278C3.58834 8.41431 4.04603 7.18031 4.79459 6.12528C5.54315 5.07025 6.5581 4.23025 7.74444 3.69C8.74144 3.23378 9.82794 2.99728 10.9278 3H11.3333C13.0992 3.09714 14.766 3.83535 16.0403 5.10968C17.3147 6.38401 18.0529 8.05083 18.15 9.81667L17.5 9.58333Z" 
        stroke="#596881" 
        strokeWidth="1.875" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface TopBarProps {
  user?: {
    name: string;
    email: string;
    image?: string;
  };
  onSearch?: (query: string) => void;
  onNotifications?: () => void;
  onSettings?: () => void;
  onProfile?: () => void;
}

export function TopBar({
  user,
  onSearch,
  onNotifications,
  onSettings,
  onProfile,
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <div 
      className="flex flex-col items-start"
      style={{ 
        padding: "12px 24px",
        gap: "24px",
        background: "#FFFFFF",
        borderRadius: "16px"
      }}
    >
      <div className="flex w-full items-center justify-between">
        {/* Left - Page label */}
        <div className="flex items-center gap-2">
          <MessageCircleIcon className="h-5 w-5" />
          <span 
            className="font-medium"
            style={{ 
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.006em",
              color: "#111625"
            }}
          >
            Message
          </span>
        </div>

        {/* Right - Controls */}
        <div className="flex items-center gap-4">
          {/* Search and other controls container */}
          <div className="flex items-center gap-3">
            {/* Search form */}
            <div 
              className="flex items-center gap-2"
              style={{
                width: "300px",
                height: "32px",
                padding: "10px 4px 10px 10px",
                border: "1px solid #E8E5DF",
                borderRadius: "10px"
              }}
            >
              <Search className="h-3.5 w-3.5" style={{ color: "#8796AF" }} />
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    onSearch?.(e.target.value);
                  }}
                  className="flex-1 bg-transparent text-xs outline-none placeholder:text-[#8796AF]"
                  style={{ 
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    lineHeight: "16px",
                    color: "#111625"
                  }}
                />
                <div 
                  className="flex items-center gap-1"
                  style={{
                    padding: "5px 6px",
                    background: "#F3F3EE",
                    borderRadius: "6px"
                  }}
                >
                  <span 
                    style={{ 
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      lineHeight: "16px",
                      color: "#404040"
                    }}
                  >
                    ⌘+K
                  </span>
                </div>
              </div>
            </div>

            {/* Notification button */}
            <button
              onClick={onNotifications}
              className="flex items-center justify-center"
              style={{
                width: "32px",
                height: "32px",
                background: "#FFFFFF",
                border: "1px solid #E8E5DF",
                borderRadius: "8px"
              }}
            >
              <Bell className="h-4 w-4" style={{ color: "#262626" }} />
            </button>

            {/* Settings button */}
            <button
              onClick={onSettings}
              className="flex items-center justify-center"
              style={{
                width: "32px",
                height: "32px",
                background: "#FFFFFF",
                border: "1px solid #E8E5DF",
                borderRadius: "8px"
              }}
            >
              <Settings className="h-4 w-4" style={{ color: "#262626" }} />
            </button>
          </div>

          {/* Divider */}
          <div 
            style={{ 
              width: "0px",
              height: "20px",
              border: "1px solid #E8E5DF"
            }} 
          />

          {/* Profile container */}
          <button
            onClick={onProfile}
            className="flex items-center gap-2"
          >
            <Avatar style={{ width: "32px", height: "32px" }}>
              <AvatarImage src={user?.image} alt={user?.name} />
              <AvatarFallback className="text-xs">
                {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4" style={{ color: "#262626" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
