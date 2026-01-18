"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LogoMenuProps {
  user?: {
    name: string;
    email: string;
    image?: string;
  };
  children: React.ReactNode;
}

export function LogoMenu({ user, children }: LogoMenuProps) {
  // Arrow icon component
  const ArrowRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "matrix(-1, 0, 0, 1, 0, 0)" }}>
      <path d="M6.17 4.17L9.84 7.84L6.17 11.51" stroke="#09090B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 2.5L13.5 5L6.5 12H4V9.5L11 2.5Z" stroke="#09090B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const GiftIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 8V14M8 2V5M13 3.5V6.5C13 7.88 11.88 9 10.5 9H5.5C4.12 9 3 7.88 3 6.5V3.5C3 2.12 4.12 1 5.5 1H10.5C11.88 1 13 2.12 13 3.5Z" stroke="#1C1C1C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 5H13" stroke="#1C1C1C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const SunIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="3" stroke="#1C1C1C" strokeWidth="1.2"/>
      <path d="M8 1V2M8 14V15M15 8H14M2 8H1M12.95 3.05L12.24 3.76M3.76 12.24L3.05 12.95M12.95 12.95L12.24 12.24M3.76 3.76L3.05 3.05" stroke="#1C1C1C" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );

  const LogoutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 3H4C3.44772 3 3 3.44772 3 4V12C3 12.5523 3.44772 13 4 13H6M10 11L13 8L10 5M13 8H6" stroke="#1C1C1C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        side="right" 
        align="start"
        sideOffset={16}
        className="flex flex-col items-start p-1 gap-1 bg-white"
        style={{
          width: "307px",
          borderRadius: "16px",
          boxShadow: "0px 1px 13.8px 1px rgba(18, 18, 18, 0.1)",
          border: "none"
        }}
      >
        {/* Top Section */}
        <div className="flex flex-col justify-center items-start w-full px-1 py-0 gap-2">
          {/* Go back to dashboard */}
          <button className="flex flex-col justify-center items-start p-1 gap-2 w-full h-[40px] rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex flex-row items-center p-0 gap-2 w-full h-[28px]">
              <div className="flex flex-row items-center p-1.5 gap-2.5 w-[28px] h-[28px] bg-[#F3F3EE] rounded-[6px]">
                <ArrowRightIcon />
              </div>
              <span className="w-[146px] h-[20px] font-medium text-[14px] leading-[20px] text-[#09090B] tracking-[-0.01em]">
                Go back to dashboard
              </span>
            </div>
          </button>

          {/* Rename file */}
          <button className="flex flex-col justify-center items-start p-1 gap-2 w-full h-[40px] bg-[#F8F8F5] rounded-lg">
            <div className="flex flex-row items-center p-0 gap-2 w-full h-[28px]">
              <div className="flex flex-row items-center p-1.5 gap-2.5 w-[28px] h-[28px] bg-white rounded-[6px]">
                <EditIcon />
              </div>
              <span className="w-[77px] h-[20px] font-medium text-[14px] leading-[20px] text-[#09090B] tracking-[-0.01em]">
                Rename file
              </span>
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="flex flex-col items-start px-2.5 py-0 gap-2 w-full h-px">
          <div className="w-full h-px border-t border-[#E8E5DF]" />
        </div>

        {/* User Info & Credits Section */}
        <div className="flex flex-col items-start px-1 py-0 gap-2 w-full">
          {/* Profile Item */}
          <div className="flex flex-row items-center p-2 gap-3 w-full h-[56px] rounded-lg">
            {user && (
              <div className="flex flex-col justify-center items-start p-0 gap-0.5 w-[283px] h-[40px]">
                <span className="w-[56px] h-[20px] font-semibold text-[14px] leading-[20px] text-[#1C1C1C] tracking-[-0.01em]">
                  {user.name}
                </span>
                <span className="w-full h-[18px] font-normal text-[12px] leading-[18px] text-[#8B8B8B] tracking-[-0.01em]">
                  {user.email}
                </span>
              </div>
            )}
          </div>

          {/* User Info (repeated in design? Assuming this is the main container for credits) */}
          <div className="flex flex-col items-start p-0 gap-2 w-full">
            {/* Credits Card */}
            <div className="flex flex-col items-start px-2.5 py-2 gap-2 w-full bg-[#FFFFFF] rounded-lg">
              {/* Card Container - Matching Figma 'List item' with gray background */}
              <div className="flex flex-col justify-center items-start p-2 gap-2 w-full h-[100px] bg-[#F8F8F5] rounded-lg">
                
                {/* Header: Credits / Renews in */}
                <div className="flex flex-row items-start p-0 gap-2 w-full h-[40px]">
                  <div className="flex flex-col justify-center items-start p-0 gap-0.5 flex-1 h-[40px]">
                    <span className="h-[18px] font-normal text-[12px] leading-[18px] text-[#8B8B8B]">
                      Credits
                    </span>
                    <span className="h-[20px] font-medium text-[14px] leading-[20px] text-[#09090B]">
                      20 left
                    </span>
                  </div>
                  <div className="flex flex-col justify-center items-end p-0 gap-0.5 flex-1 h-[40px]">
                    <span className="h-[18px] font-normal text-[12px] leading-[18px] text-[#8B8B8B] text-right">
                      Renews in
                    </span>
                    <span className="h-[20px] font-medium text-[14px] leading-[20px] text-[#09090B] text-right">
                      6h 24m
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex flex-col items-start p-0 gap-2 w-full h-[36px]">
                  <div className="w-full h-[8px] bg-[#E8E5DF] rounded-[4px] overflow-hidden relative">
                    <div 
                      className="absolute left-0 top-0 h-[8px] bg-[#1E9A80] rounded-[4px]" 
                      style={{ width: "20%" }}
                    />
                  </div>
                  <div className="flex flex-row justify-between items-center p-0 gap-2 w-full h-[20px]">
                    <span className="font-normal text-[12px] leading-[20px] text-[#5F5F5D] tracking-[-0.01em]">
                      5 of 25 used today
                    </span>
                    <span className="font-normal text-[12px] leading-[18px] text-[#1E9A80]">
                      +25 tomorrow
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex flex-col items-start px-2.5 py-0 gap-2 w-full h-px">
          <div className="w-full h-px border-t border-[#E8E5DF]" />
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col items-start px-1 py-0 gap-2 w-full">
          {/* Win free credits */}
          <button className="flex flex-col justify-center items-start p-1.5 gap-2 w-full h-[40px] rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex flex-row items-center p-0 gap-2 w-full h-[28px]">
              <div className="flex flex-row items-center p-1.5 gap-2.5 w-[28px] h-[28px] bg-[#F3F3EE] rounded-[6px]">
                <GiftIcon />
              </div>
              <span className="font-medium text-[14px] leading-[20px] text-[#1C1C1C] tracking-[-0.01em]">
                Win free credits
              </span>
            </div>
          </button>

          {/* Theme Style */}
          <button className="flex flex-col justify-center items-start p-1.5 gap-2 w-full h-[40px] rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex flex-row items-center p-0 gap-2 w-full h-[28px]">
              <div className="flex flex-row items-center p-1.5 gap-2.5 w-[28px] h-[28px] bg-[#F3F3EE] rounded-[6px]">
                <SunIcon />
              </div>
              <span className="font-medium text-[14px] leading-[20px] text-[#1C1C1C] tracking-[-0.01em]">
                Theme Style
              </span>
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="flex flex-col items-start px-2.5 py-0 gap-2 w-full h-px">
          <div className="w-full h-px border-t border-[#E8E5DF]" />
        </div>

        {/* Log out */}
        <div className="flex flex-col items-start px-1 py-0 gap-2 w-full">
          <button className="flex flex-col justify-center items-start p-1.5 gap-2 w-full h-[40px] rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex flex-row items-center p-0 gap-2 w-full h-[28px]">
              <div className="flex flex-row items-center p-1.5 gap-2.5 w-[28px] h-[28px] bg-[#F3F3EE] rounded-[6px]">
                <LogoutIcon />
              </div>
              <span className="font-medium text-[14px] leading-[20px] text-[#1C1C1C] tracking-[-0.01em]">
                Log out
              </span>
            </div>
          </button>
        </div>

      </PopoverContent>
    </Popover>
  );
}
