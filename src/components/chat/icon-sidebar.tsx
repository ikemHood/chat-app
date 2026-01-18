"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Home, MessageCircle, FileText, Settings, LogOut } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";

interface IconSidebarProps {
  activeItem?: "home" | "messages" | "files" | "settings";
  onNavigate?: (item: "home" | "messages" | "files" | "settings") => void;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
  onLogout?: () => void;
}

const navItems = [
  { id: "home" as const, icon: Home, label: "Home" },
  { id: "messages" as const, icon: MessageCircle, label: "Messages" },
  { id: "files" as const, icon: FileText, label: "Files" },
  { id: "settings" as const, icon: Settings, label: "Settings" },
];

export function IconSidebar({
  activeItem = "messages",
  onNavigate,
  user,
  onLogout,
}: IconSidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full w-16 flex-col items-center border-r border-border bg-sidebar py-4">
        {/* Logo */}
        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary">
          <MessageCircle className="h-5 w-5 text-primary-foreground" />
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col items-center gap-2">
          {navItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeItem === item.id ? "secondary" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-10 w-10",
                    activeItem === item.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                  onClick={() => onNavigate?.(item.id)}
                >
                  <item.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col items-center gap-3">
          <ThemeToggle />
          
          {onLogout && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-muted-foreground hover:text-foreground"
                  onClick={onLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Log out
              </TooltipContent>
            </Tooltip>
          )}

          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer border-2 border-transparent transition-colors hover:border-primary">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className="text-xs">
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
