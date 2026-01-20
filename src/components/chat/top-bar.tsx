"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserMenu } from "./user-menu";

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
  onLogout?: () => void;
}

export function TopBar({
  user,
  onSearch,
  onNotifications,
  onSettings,
  onProfile,
  onLogout,
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    /* Top Bar Container - 1340x56 */
    <div className="flex flex-col items-start px-6 py-3 gap-6 w-full h-[56px] bg-white rounded-[16px]">
      {/* Inner Auto Layout - 1292x32 */}
      <div className="flex flex-row justify-between items-center w-full h-[32px] gap-[9px]">

        {/* Page Label - 89x20 */}
        <div className="flex flex-row items-center gap-2 h-5 w-[89px]">
          {/* Task Icon - 20x20 */}
          <img
            src="/icons/Task Icon.svg"
            alt="Task"
            className="w-5 h-5 flex-none"
          />

          {/* Greeting - 61x20 */}
          <span className="w-[61px] h-5 font-medium text-[14px] leading-5 text-[#111625]">
            Message
          </span>
        </div>

        {/* Right Column - 476x32 */}
        <div className="flex flex-row items-center gap-4 w-[476px] h-8">

          {/* Container (Search + Icons) - 388x32 */}
          <div className="flex flex-row items-center gap-3 w-[388px] h-8">

            {/* Search Form - 300x32 */}
            <div className="box-border flex flex-row items-center px-[10px] py-[10px] gap-2 w-[300px] h-8 border border-[#E8E5DF] rounded-[10px]">
              {/* Search Icon - 14x14 */}
              <img
                src="/icons/search.svg"
                alt="Search"
                className="w-[14px] h-[14px] flex-none"
              />

              {/* Text Input Container */}
              <div className="flex flex-row items-center gap-[10px] w-[264px] h-6 p-[1.5px] grow">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    onSearch?.(e.target.value);
                  }}
                  className="w-[214px] h-4 font-normal text-[12px] leading-4 text-[#8796AF] placeholder-[#8796AF] outline-none bg-transparent"
                />

                {/* Command Shortcut - 40x24 */}
                <div className="flex flex-row items-center px-[6px] py-[5px] gap-1 w-10 h-6 bg-[#F3F3EE] rounded-[6px]">
                  <span className="w-7 h-4 font-normal text-[12px] leading-4 text-[#404040]">
                    ⌘+K
                  </span>
                </div>
              </div>
            </div>

            {/* Notification Icon - 32x32 */}
            <button
              onClick={onNotifications}
              className="box-border flex flex-row justify-center items-center p-0 gap-1 w-8 h-8 bg-white border border-[#E8E5DF] rounded-[8px]"
            >
              <img
                src="/icons/bell.svg"
                alt="Notifications"
                className="w-4 h-4 flex-none"
              />
            </button>

            {/* Settings Icon - 32x32 */}
            <button
              onClick={onSettings}
              className="box-border flex flex-row justify-center items-center p-0 gap-1 w-8 h-8 bg-white border border-[#E8E5DF] rounded-[8px]"
            >
              <img
                src="/icons/settings.svg"
                alt="Settings"
                className="w-4 h-4 flex-none"
              />
            </button>
          </div>

          {/* Divider */}
          <div className="w-0 h-5 border border-[#E8E5DF]" />

          {/* Profile Container - 56x32 */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex flex-row items-center gap-2 w-[56px] h-8 outline-none">
                {/* Avatar - 32x32 */}
                <Avatar className="w-8 h-8 rounded-full bg-[#F7F9FB]">
                  <AvatarImage src={user?.image} alt={user?.name} className="object-cover" />
                  <AvatarFallback className="text-xs">
                    {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Chevron Icon - 16x16 */}
                <img
                  src="/icons/Navbar Company Selector.svg"
                  alt="Menu"
                  className="w-4 h-4 flex-none"
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-none bg-transparent" align="end" sideOffset={8}>
              <UserMenu user={user} onLogout={onLogout} />
            </PopoverContent>
          </Popover>

        </div>
      </div>
    </div>
  );
}

