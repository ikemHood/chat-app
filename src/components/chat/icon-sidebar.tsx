"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserMenu } from "./user-menu";

interface IconSidebarProps {
  activeItem?: "home" | "messages" | "compass" | "folder" | "images";
  onNavigate?: (item: "home" | "messages" | "compass" | "folder" | "images") => void;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
  onLogout?: () => void;
}

const navItems = [
  { id: "home" as const, icon: "/icons/House.svg", label: "Home" },
  { id: "messages" as const, icon: "/icons/ChatCircle.svg", label: "Messages" },
  { id: "compass" as const, icon: "/icons/Compass.svg", label: "Explore" },
  { id: "folder" as const, icon: "/icons/Folder.svg", label: "Files" },
  { id: "images" as const, icon: "/icons/ImagesSquare.svg", label: "Media" },
];

export function IconSidebar({
  activeItem = "messages",
  onNavigate,
  user,
  onLogout,
}: IconSidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div
        className="flex h-full flex-col items-start justify-between py-6 px-4 w-[76px] border-r border-border/10"
      >
        {/* Top container */}
        <div className="flex flex-col items-center w-full gap-8">
          {/* Logo */}
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center justify-center w-11 h-11 cursor-pointer hover:opacity-90 transition-opacity flex-none">

                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-[44px] w-[44px]"
                />
              </div>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="start"
              sideOffset={16}
              className="p-0 border-none shadow-none bg-transparent w-auto"
            >
              <UserMenu user={user} onLogout={onLogout} />
            </PopoverContent>
          </Popover>

          {/* Navigation */}
          <nav className="flex flex-col items-center gap-2">
            {navItems.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center cursor-pointer justify-center w-11 h-11 rounded-lg transition-all border border-transparent box-border",
                      activeItem === item.id
                        ? "bg-[#F0FDF4] border-[#1E9A80]"
                        : "hover:bg-muted"
                    )}
                    onClick={() => onNavigate?.(item.id)}
                  >

                    <img
                      src={item.icon}
                      alt={item.label}
                      className="w-5 h-5 text-[#151515]"
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>
        </div>

        {/* Bottom container */}
        <div className="flex flex-col items-center gap-6 w-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="flex items-center justify-center w-11 h-11 rounded-lg hover:bg-muted transition-all"
              >

                <img
                  src="/icons/StarFour.svg"
                  alt="Theme"
                  className="w-5 h-5"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Theme
            </TooltipContent>
          </Tooltip>

          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar
                  className="cursor-pointer w-11 h-11"
                >
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className="text-sm">
                    {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
