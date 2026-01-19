"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoMenu } from "./logo-menu";

// Custom icons matching the Figma design
function HouseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 7.5L10 1.875L17.5 7.5V16.25C17.5 16.5815 17.3683 16.8995 17.1339 17.1339C16.8995 17.3683 16.5815 17.5 16.25 17.5H3.75C3.41848 17.5 3.10054 17.3683 2.86612 17.1339C2.6317 16.8995 2.5 16.5815 2.5 16.25V7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.5 17.5V10H12.5V17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChatCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 11.1642 2.76696 12.2661 3.24211 13.2489C3.36527 13.5035 3.40844 13.7917 3.34735 14.0683L2.81901 16.4589C2.77709 16.6487 2.78625 16.8463 2.8455 17.0316C2.90476 17.217 3.01186 17.3834 3.15593 17.5141C3.30001 17.6448 3.47591 17.7354 3.66591 17.7767C3.85591 17.818 4.05311 17.8086 4.23835 17.7495L6.93165 16.8505C7.20829 16.7581 7.50856 16.7692 7.77744 16.882C8.46152 17.1695 9.19979 17.3281 9.97187 17.3281" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.2322 6.76777L11.5536 11.5536L6.76777 13.2322L8.44645 8.44645L13.2322 6.76777Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 15.625C17.5 15.9565 17.3683 16.2745 17.1339 16.5089C16.8995 16.7433 16.5815 16.875 16.25 16.875H3.75C3.41848 16.875 3.10054 16.7433 2.86612 16.5089C2.6317 16.2745 2.5 15.9565 2.5 15.625V4.375C2.5 4.04348 2.6317 3.72554 2.86612 3.49112C3.10054 3.2567 3.41848 3.125 3.75 3.125H7.5L9.375 5.625H16.25C16.5815 5.625 16.8995 5.7567 17.1339 5.99112C17.3683 6.22554 17.5 6.54348 17.5 6.875V15.625Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ImagesSquareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 2.5H5C3.61929 2.5 2.5 3.61929 2.5 5V15C2.5 16.3807 3.61929 17.5 5 17.5H15C16.3807 17.5 17.5 16.3807 17.5 15V5C17.5 3.61929 16.3807 2.5 15 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.5 8.75C8.19036 8.75 8.75 8.19036 8.75 7.5C8.75 6.80964 8.19036 6.25 7.5 6.25C6.80964 6.25 6.25 6.80964 6.25 7.5C6.25 8.19036 6.80964 8.75 7.5 8.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.5 12.5L14.1161 9.11612C13.8817 8.8817 13.5637 8.75 13.2322 8.75C12.9007 8.75 12.5827 8.8817 12.3483 9.11612L5 16.4645" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function StarFourIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 1.25L11.7678 8.23223L18.75 10L11.7678 11.7678L10 18.75L8.23223 11.7678L1.25 10L8.23223 8.23223L10 1.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

interface IconSidebarProps {
  activeItem?: "home" | "messages" | "compass" | "folder" | "images";
  onNavigate?: (item: "home" | "messages" | "compass" | "folder" | "images") => void;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
}

const navItems = [
  { id: "home" as const, icon: HouseIcon, label: "Home" },
  { id: "messages" as const, icon: ChatCircleIcon, label: "Messages" },
  { id: "compass" as const, icon: CompassIcon, label: "Explore" },
  { id: "folder" as const, icon: FolderIcon, label: "Files" },
  { id: "images" as const, icon: ImagesSquareIcon, label: "Media" },
];

export function IconSidebar({
  activeItem = "messages",
  onNavigate,
  user,
}: IconSidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div 
        className="flex h-full flex-col items-center justify-between py-6 px-2 md:px-4 w-[60px] md:w-[76px]"
        style={{ 
          background: "#F3F3EE"
        }}
      >
        {/* Top container */}
        <div className="flex flex-col items-center gap-8">
          {/* Logo with Popover Menu */}
          <LogoMenu user={user}>
            <div className="relative overflow-hidden rounded-full cursor-pointer hover:opacity-90 transition-opacity w-9 h-9 md:w-11 md:h-11">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-full w-full object-cover"
              />
            </div>
          </LogoMenu>

          {/* Navigation */}
          <nav className="flex flex-col items-center gap-2">
            {navItems.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center justify-center rounded-lg transition-all",
                      "w-9 h-9 md:w-11 md:h-11",
                      activeItem === item.id 
                        ? "bg-[#F0FDF4] border border-[#1E9A80]" 
                        : "hover:bg-muted"
                    )}
                    onClick={() => onNavigate?.(item.id)}
                  >
                    <item.icon className="h-5 w-5 text-[#151515]" />
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
        <div className="flex flex-col items-center gap-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="flex items-center justify-center rounded-lg w-9 h-9 md:w-11 md:h-11 hover:bg-muted transition-all"
              >
                <StarFourIcon className="h-5 w-5 text-[#151515]" />
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
                  className="cursor-pointer w-9 h-9 md:w-11 md:h-11"
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
