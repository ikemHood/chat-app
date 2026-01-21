"use client";

import * as React from "react";
import { Image as ImageIcon } from "lucide-react";
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
    <div className="bg-[#F8F8F5] px-[12px] py-[8px] h-[32px] flex items-center rounded-[8px] mb-[4px]">
      <span className="text-[12px] font-medium leading-[16px] text-[#8B8B8B] font-sans">{title}</span>
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
    <div className="space-y-[8px]">
      {Object.entries(grouped).map(([month, monthItems]) => (
        <div key={month} className="flex flex-col">
          <SectionHeader title={month} />
          <div className="grid grid-cols-4 gap-[4px]">
            {monthItems.map((item) => (
              <button
                key={item.id}
                className="relative aspect-square overflow-hidden rounded-[8px] bg-muted hover:opacity-90 transition-opacity ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
        <img src="/icons/paperclip.svg" alt="Links" className="mb-2 h-8 w-8 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">No links shared yet</p>
      </div>
    );
  }

  const grouped = groupByMonth(items);

  return (
    <div className="space-y-[16px]">
      {Object.entries(grouped).map(([month, monthItems]) => (
        <div key={month} className="flex flex-col gap-[12px]">
          <SectionHeader title={month} />
          <div className="flex flex-col gap-[12px]">
            {monthItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-row items-center gap-[12px] group h-[60px]"
              >
                <div className="shrink-0 flex h-[60px] w-[60px] items-center justify-center rounded-[12px] bg-[#F7F9FB] overflow-hidden group-hover:bg-[#F0F2F5] transition-colors">
                  {item.favicon ? (
                    <img src={item.favicon} alt="" className="h-[32px] w-[32px] object-contain" />
                  ) : (
                    <img src="/icons/paperclip.svg" alt="Link" className="h-[24px] w-[24px] opacity-50" />
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-[4px] justify-center h-full">
                  <p className="text-[14px] font-medium leading-[20px] tracking-[-0.006em] text-[#111625] truncate font-sans group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[12px] font-normal leading-[16px] text-[#8B8B8B] line-clamp-2 font-sans">
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

function FileIcon({ type }: { type: string }) {
  const meta = React.useMemo(() => {
    switch (type.toLowerCase()) {
      case "pdf":
        return { color: "#FF1607", label: "PDF" };
      case "ai":
      case "illustrator":
        return { color: "#FF5C00", label: "AI" };
      case "fig":
      case "figma":
        return { color: "#6E45F0", label: "FIG" };
      default:
        return { color: "#007AFF", label: type.toUpperCase().slice(0, 3) };
    }
  }, [type]);

  return (
    <div className="relative w-[31.5px] h-[36px]">
      {/* Main Rectangle */}
      <div className="absolute inset-0 bg-white border-[1.35px] border-[#E8E5DF]" />

      {/* Detail Rectangle (Top Right) */}
      <div
        className="absolute border-[1.35px] border-[#E8E5DF]"
        style={{
          left: "56.67%",
          right: "3.33%",
          top: "2.5%",
          bottom: "67.5%"
        }}
      />

      {/* Tag */}
      <div
        className="absolute flex items-center justify-center rounded-[1.8px] shadow-sm"
        style={{
          backgroundColor: meta.color,
          left: "0px",
          bottom: "4.5px",
          padding: "1.8px 2.25px",
          height: "14.6px",
          minWidth: "18px"
        }}
      >
        <span className="font-bold text-[9px] leading-[11px] text-center tracking-[-0.02em] text-white font-sans uppercase">
          {meta.label}
        </span>
      </div>
    </div>
  );
}

function DocList({ items }: { items: DocItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileIcon type="DOC" />
        <p className="text-sm text-muted-foreground mt-2">No documents shared yet</p>
      </div>
    );
  }

  const grouped = groupByMonth(items);

  return (
    <div className="space-y-[16px]">
      {Object.entries(grouped).map(([month, monthItems]) => (
        <div key={month} className="flex flex-col gap-[12px]">
          <SectionHeader title={month} />
          <div className="flex flex-col gap-[12px]">
            {monthItems.map((item) => (
              <button
                key={item.id}
                className="flex w-full items-center gap-[12px] group hover:bg-muted/50 rounded-lg transition-colors text-left"
                onClick={() => console.log("Open doc", item.id)}
              >
                <div className="shrink-0 flex h-[60px] w-[60px] items-center justify-center rounded-[12px] bg-[#F3F3EE]">
                  <FileIcon type={item.type} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-[6px]">
                  <p className="text-[14px] font-medium leading-[20px] tracking-[-0.006em] text-[#1C1C1C] truncate font-sans">
                    {item.name}
                  </p>
                  <p className="text-[12px] font-normal leading-[16px] text-[#8B8B8B] font-sans flex items-center gap-1">
                    {item.pages && (
                      <>
                        <span>{item.pages} pages</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{item.size}</span>
                    <span>•</span>
                    <span className="lowercase">{item.type}</span>
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
      className="absolute right-3 top-3 bottom-3 w-[450px] bg-white rounded-[24px] z-20 flex flex-col overflow-hidden shadow-[0px_4px_32px_rgba(0,0,0,0.12)] h-[1000px] max-h-[calc(100vh-24px)]"
      style={{ right: '12px', top: '12px' }}
    >

      {/* Header */}
      <div className="flex items-center gap-[10px] justify-center pt-[24px] pb-[24px] shrink-0">
        <h2
          className="text-[20px] font-semibold text-[#111625] leading-[28px] text-center"
          style={{ fontFamily: "'Inter Display', sans-serif" }}
        >
          Contact Info
        </h2>
        <button
          onClick={onClose}
          className="absolute right-[24px] top-[24px] text-[#111625] hover:opacity-70 transition-opacity"
        >
          <img src="/icons/x.svg" alt="Close" className="w-6 h-6" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 pb-6">
          {/* Profile */}
          <div className="flex flex-col items-center gap-[16px] pb-8">
            <Avatar className="h-[72px] w-[72px] bg-[#F7F9FB] rounded-full">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="text-2xl text-[#111625]">
                {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-[4px] w-full h-[44px]">
              <h3 className="text-[16px] font-medium text-[#111625] leading-[24px] text-center tracking-[-0.011em] font-sans">
                {user.name}
              </h3>
              <p className="text-[12px] font-normal text-[#8B8B8B] leading-[16px] font-sans">
                {user.email}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-row items-start gap-[16px] w-[402px] h-[32px]">
              <Button
                variant="outline"
                className="flex flex-row justify-center items-center p-[8px] gap-[6px] w-[193px] h-[32px] bg-white border border-[#E8E5DF] rounded-[8px] hover:bg-gray-50"
              >
                <img src="/icons/phone.svg" alt="Phone" className="w-[18px] h-[18px]" />
                <span className="font-medium text-[14px] leading-[20px] text-center tracking-[-0.006em] text-[#111625] font-sans">
                  Audio
                </span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-row justify-center items-center p-[8px] gap-[6px] w-[193px] h-[32px] bg-white border border-[#E8E5DF] rounded-[8px] hover:bg-gray-50"
              >
                <img src="/icons/video.svg" alt="Video" className="w-[18px] h-[18px]" />
                <span className="font-medium text-[14px] leading-[20px] text-center tracking-[-0.006em] text-[#111625] font-sans">
                  Video
                </span>
              </Button>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="media" className="w-full flex flex-col items-start gap-[12px]">
            <div className="flex flex-row justify-center items-center p-[2px] w-fit h-[40px] bg-[#F3F3EE] rounded-[12px]">
              <TabsList className="bg-transparent p-0 gap-[2px] w-full justify-start h-full flex">
                <TabsTrigger
                  value="media"
                  className="flex flex-row justify-center items-center px-[10px] py-[8px] gap-[8px] h-[36px] min-w-[61px] rounded-[10px] data-[state=active]:bg-white data-[state=active]:shadow-[0px_0px_16px_rgba(0,0,0,0.06)] bg-transparent shadow-none"
                >
                  <span className="font-medium text-[14px] leading-[20px] text-center tracking-[-0.006em] text-[#111625]">Media</span>
                </TabsTrigger>
                <TabsTrigger
                  value="link"
                  className="flex flex-row justify-center items-center px-[10px] py-[8px] gap-[8px] h-[36px] min-w-[48px] rounded-[10px] data-[state=active]:bg-white data-[state=active]:shadow-[0px_0px_16px_rgba(0,0,0,0.06)] bg-transparent shadow-none"
                >
                  <span className="font-medium text-[14px] leading-[20px] text-center tracking-[-0.006em] text-[#8B8B8B] data-[state=active]:text-[#111625]">Link</span>
                </TabsTrigger>
                <TabsTrigger
                  value="docs"
                  className="flex flex-row justify-center items-center px-[10px] py-[8px] gap-[8px] h-[36px] min-w-[54px] rounded-[10px] data-[state=active]:bg-white data-[state=active]:shadow-[0px_0px_16px_rgba(0,0,0,0.06)] bg-transparent shadow-none"
                >
                  <span className="font-medium text-[14px] leading-[20px] text-center tracking-[-0.006em] text-[#8B8B8B] data-[state=active]:text-[#111625]">Docs</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="media" className="mt-0 w-full outline-none animate-in fade-in-50 duration-300">
              <MediaGrid items={displayMedia} />
            </TabsContent>
            <TabsContent value="link" className="mt-0 w-full outline-none animate-in fade-in-50 duration-300">
              <LinkList items={displayLinks} />
            </TabsContent>
            <TabsContent value="docs" className="mt-0 w-full outline-none animate-in fade-in-50 duration-300">
              <DocList items={displayDocs} />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
