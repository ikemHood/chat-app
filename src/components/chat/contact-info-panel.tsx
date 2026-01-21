"use client";

import * as React from "react";
import { X, Phone, Video, FileText, Link as LinkIcon, Image as ImageIcon, FileCode, FileImage } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatUser } from "@/types";

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
  pages?: string;
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

// Helper to group items by month
function groupByMonth<T extends { date: Date }>(items: T[]) {
  return items.reduce((acc, item) => {
    const monthYear = item.date.toLocaleDateString("en-US", { month: "long" });
    acc[monthYear] ??= [];
    acc[monthYear].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-[#F8F8F5] px-3 h-8 flex items-center rounded-lg mb-2">
      <span className="text-[12px] font-medium text-[#8B8B8B]">{title}</span>
    </div>
  );
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

  const grouped = groupByMonth(items);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([month, monthItems]) => (
        <div key={month}>
          <SectionHeader title={month} />
          <div className="grid grid-cols-4 gap-2">
            {monthItems.map((item) => (
              <button
                key={item.id}
                className="relative aspect-square overflow-hidden rounded-lg bg-muted hover:opacity-90 transition-opacity ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

  const grouped = groupByMonth(items);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([month, monthItems]) => (
        <div key={month}>
          <SectionHeader title={month} />
          <div className="space-y-3">
            {monthItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 group"
              >
                <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-muted group-hover:bg-muted/80 transition-colors">
                  {item.favicon ? (
                    <>

                      <img src={item.favicon} alt="" className="h-5 w-5" />
                    </>
                  ) : (
                    <LinkIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.description ?? item.url}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function getFileIcon(type: string) {
  switch (type.toLowerCase()) {
    case "pdf":
      return <FileText className="h-5 w-5 text-red-500" />;
    case "ai":
    case "illustrator":
      return <FileImage className="h-5 w-5 text-orange-500" />;
    case "fig":
    case "figma":
      return <FileCode className="h-5 w-5 text-purple-500" />;
    default:
      return <FileText className="h-5 w-5 text-blue-500" />;
  }
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

  const grouped = groupByMonth(items);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([month, monthItems]) => (
        <div key={month}>
          <SectionHeader title={month} />
          <div className="space-y-3">
            {monthItems.map((item) => (
              <button
                key={item.id}
                className="flex w-full items-start gap-3 group hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors"
                onClick={() => console.log("Open doc", item.id)}
              >
                <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
                  {getFileIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.pages ? `${item.pages} pages • ` : ""}{item.size} • {item.type}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// MOCK DATA GENERATORS (To be removed when real data is connected)
const MOCK_MEDIA: MediaItem[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `media-${i}`,
  type: "image",
  url: `https://picsum.photos/seed/${i}/200`,
  date: new Date(2023, i % 3 === 0 ? 4 : i % 3 === 1 ? 3 : 2, 15), // May, April, March
}));

const MOCK_LINKS: LinkItem[] = [
  {
    id: "l1",
    url: "https://basecamp.net",
    title: "https://basecamp.net/",
    description: "Discover thousands of premium UI kits, templates, and design resources styled for designers.",
    date: new Date(2023, 4, 10),
  },
  {
    id: "l2",
    url: "https://notion.com",
    title: "https://notion.com/",
    description: "A new tool that blends your everyday work apps into one. It's the all-in-one workspace.",
    date: new Date(2023, 4, 12),
  },
  {
    id: "l3",
    url: "https://asana.com",
    title: "https://asana.com/",
    description: "Work anytime, anywhere with Asana. Keep remote and distributed teams, and your entire organization focused.",
    date: new Date(2023, 4, 15),
  },
  {
    id: "l4",
    url: "https://trello.com",
    title: "https://trello.com/",
    description: "Make the impossible, possible with Trello. The ultimate teamwork project management tool.",
    date: new Date(2023, 4, 18),
  }
];

const MOCK_DOCS: DocItem[] = [
  { id: "d1", name: "Document Requirement.pdf", size: "16 MB", type: "pdf", pages: "10", date: new Date(2023, 4, 10) },
  { id: "d2", name: "User Flow.pdf", size: "32 MB", type: "pdf", pages: "7", date: new Date(2023, 4, 11) },
  { id: "d3", name: "Existing App.fig", size: "233 MB", type: "fig", date: new Date(2023, 4, 12) },
  { id: "d4", name: "Product Illustrations.ai", size: "72 MB", type: "ai", date: new Date(2023, 4, 13) },
  { id: "d5", name: "Quotation-Hikariworks-May.pdf", size: "329 KB", type: "pdf", pages: "2", date: new Date(2023, 4, 14) },
];


export function ContactInfoPanel({
  open,
  onClose,
  user,
  media = [],
  links = [],
  docs = [],
}: ContactInfoPanelProps) {
  if (!open || !user) return null;

  // Use mock data if props are empty for visualization
  const displayMedia = media.length > 0 ? media : MOCK_MEDIA;
  const displayLinks = links.length > 0 ? links : MOCK_LINKS;
  const displayDocs = docs.length > 0 ? docs : MOCK_DOCS;

  return (
    <div
      className="absolute right-3 top-3 bottom-3 w-[450px] bg-white rounded-[24px] z-20 flex flex-col overflow-hidden border border-gray-100 shadow-[0px_4px_32px_rgba(0,0,0,0.12)] h-[calc(100vh-24px)]"
    >

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
        <h2 className="text-[20px] font-semibold text-[#111625] leading-7">Contact Info</h2>
        <button
          onClick={onClose}
          className="text-[#111625] hover:opacity-70 transition-opacity"
        >
          <X size={24} />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 pb-6">
          {/* Profile */}
          <div className="flex flex-col items-center pt-2 pb-8">
            <Avatar className="h-[72px] w-[72px] mb-4 bg-[#F7F9FB]">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="text-2xl text-[#111625]">
                {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-1 mb-6">
              <h3 className="text-[16px] font-medium text-[#111625] leading-6 -tracking-[0.011em]">{user.name}</h3>
              <p className="text-[12px] text-[#8B8B8B] leading-4">{user.email}</p>
            </div>

            {/* Actions */}
            <div className="flex w-full gap-4">
              <Button
                variant="outline"
                className="flex-1 h-8 rounded-lg border-[#E8E5DF] text-[#111625] text-[14px] font-medium gap-1.5 hover:bg-gray-50 bg-white"
              >
                <Phone size={18} /> Audio
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-8 rounded-lg border-[#E8E5DF] text-[#111625] text-[14px] font-medium gap-1.5 hover:bg-gray-50 bg-white"
              >
                <Video size={18} /> Video
              </Button>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="media" className="w-full">
            <TabsList className="w-fit h-10 bg-[#F3F3EE] rounded-xl p-[2px] mb-6 gap-0">
              <TabsTrigger
                value="media"
                className="px-4 h-9 rounded-[10px] data-[state=active]:bg-white data-[state=active]:shadow-[0px_0px_16px_rgba(0,0,0,0.06)] text-[14px] font-medium text-[#8B8B8B] data-[state=active]:text-[#111625] transition-all"
              >
                Media
              </TabsTrigger>
              <TabsTrigger
                value="link"
                className="px-4 h-9 rounded-[10px] data-[state=active]:bg-white data-[state=active]:shadow-[0px_0px_16px_rgba(0,0,0,0.06)] text-[14px] font-medium text-[#8B8B8B] data-[state=active]:text-[#111625] transition-all"
              >
                Link
              </TabsTrigger>
              <TabsTrigger
                value="docs"
                className="px-4 h-9 rounded-[10px] data-[state=active]:bg-white data-[state=active]:shadow-[0px_0px_16px_rgba(0,0,0,0.06)] text-[14px] font-medium text-[#8B8B8B] data-[state=active]:text-[#111625] transition-all"
              >
                Docs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="media" className="mt-0 outline-none animate-in fade-in-50 duration-300">
              <MediaGrid items={displayMedia} />
            </TabsContent>
            <TabsContent value="link" className="mt-0 outline-none animate-in fade-in-50 duration-300">
              <LinkList items={displayLinks} />
            </TabsContent>
            <TabsContent value="docs" className="mt-0 outline-none animate-in fade-in-50 duration-300">
              <DocList items={displayDocs} />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
