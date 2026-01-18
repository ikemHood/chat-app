"use client";

import * as React from "react";
import { X, Phone, Video, FileText, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { ChatUser } from "./chat-area";

interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  date: Date;
}

interface LinkItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  date: Date;
}

interface DocItem {
  id: string;
  name: string;
  size: string;
  type: string;
  date: Date;
}

interface ContactInfoPanelProps {
  open: boolean;
  onClose: () => void;
  user?: ChatUser;
  media?: MediaItem[];
  links?: LinkItem[];
  docs?: DocItem[];
}

function MediaGrid({ items }: { items: MediaItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No media shared yet</p>
      </div>
    );
  }

  // Group by month
  const grouped = items.reduce((acc, item) => {
    const monthYear = item.date.toLocaleDateString([], { month: "long", year: "numeric" });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(item);
    return acc;
  }, {} as Record<string, MediaItem[]>);

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([month, monthItems]) => (
        <div key={month}>
          <h4 className="mb-2 text-xs font-medium text-muted-foreground">{month}</h4>
          <div className="grid grid-cols-3 gap-1">
            {monthItems.map((item) => (
              <button
                key={item.id}
                className="relative aspect-square overflow-hidden rounded-md bg-muted hover:opacity-80 transition-opacity"
              >
                <img
                  src={item.thumbnail ?? item.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LinkList({ items }: { items: LinkItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <LinkIcon className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No links shared yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted transition-colors"
        >
          {item.favicon ? (
            <img src={item.favicon} alt="" className="h-8 w-8 rounded" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-primary">{item.title}</p>
            <p className="truncate text-xs text-muted-foreground">{item.description ?? item.url}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

function DocList({ items }: { items: DocItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No documents shared yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <button
          key={item.id}
          className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-muted transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded bg-destructive/10">
            <FileText className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1 overflow-hidden text-left">
            <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              {item.size} • {item.type}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

export function ContactInfoPanel({
  open,
  onClose,
  user,
  media = [],
  links = [],
  docs = [],
}: ContactInfoPanelProps) {
  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-80 p-0 sm:w-96">
        <SheetHeader className="sr-only">
          <SheetTitle>Contact Info</SheetTitle>
        </SheetHeader>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold text-foreground">Contact Info</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-57px)]">
          {/* Profile */}
          <div className="flex flex-col items-center border-b border-border py-6">
            <Avatar className="mb-3 h-20 w-20">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="text-2xl">
                {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold text-foreground">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            
            {/* Actions */}
            <div className="mt-4 flex gap-4">
              <Button variant="outline" className="gap-2">
                <Phone className="h-4 w-4" />
                Audio
              </Button>
              <Button variant="outline" className="gap-2">
                <Video className="h-4 w-4" />
                Video
              </Button>
            </div>
          </div>

          {/* Media tabs */}
          <div className="p-4">
            <Tabs defaultValue="media">
              <TabsList className="w-full">
                <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
                <TabsTrigger value="link" className="flex-1">Link</TabsTrigger>
                <TabsTrigger value="docs" className="flex-1">Docs</TabsTrigger>
              </TabsList>
              <TabsContent value="media" className="mt-4">
                <MediaGrid items={media} />
              </TabsContent>
              <TabsContent value="link" className="mt-4">
                <LinkList items={links} />
              </TabsContent>
              <TabsContent value="docs" className="mt-4">
                <DocList items={docs} />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
