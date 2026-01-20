"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserMenuProps {
    user?: {
        name: string;
        email: string;
        image?: string;
    };
    onClose?: () => void;
    onLogout?: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
    return (
        <div className="flex flex-col items-start py-1 gap-1 w-[307px] bg-white rounded-[16px] shadow-[0px_1px_13.8px_1px_rgba(18,18,18,0.1)] z-50">

            {/* Top Actions Section */}
            <div className="flex flex-col justify-center items-center px-1 gap-2 w-full">
                <div className="flex flex-col justify-center items-start p-1 gap-1 w-[299px] rounded-[12px]">

                    {/* Go back to dashboard */}
                    <button className="flex flex-col justify-center items-start p-1.5 gap-2 w-full h-[40px] rounded-[8px] hover:bg-gray-50 transition-colors">
                        <div className="flex flex-row items-center gap-2 w-full h-[28px]">
                            <div className="flex flex-row items-center p-1.5 gap-2.5 w-[28px] h-[28px] bg-[#F3F3EE] rounded-[6px]">
                                <div className="relative w-4 h-4">
                                    <img
                                        src="/icons/direaction right.svg"
                                        alt="Back"
                                        width={16}
                                        height={16}
                                        className="w-4 h-4"
                                    />
                                </div>
                            </div>
                            <span className="font-sans font-medium text-[14px] leading-[20px] tracking-[-0.01em] text-[#09090B]">
                                Go back to dashboard
                            </span>
                        </div>
                    </button>

                    {/* Rename file */}
                    <button className="flex flex-col justify-center items-start p-1.5 gap-2 w-full h-[40px] bg-[#F8F8F5] rounded-[8px]">
                        <div className="flex flex-row items-center gap-2 w-full h-[28px]">
                            <div className="flex flex-row items-center p-1.5 gap-2.5 w-[28px] h-[28px] bg-white rounded-[6px]">
                                <img
                                    src="/icons/edit.svg"
                                    alt="Edit"
                                    width={16}
                                    height={16}
                                    className="w-4 h-4"
                                />
                            </div>
                            <span className="font-sans font-medium text-[14px] leading-[20px] tracking-[-0.01em] text-[#09090B]">
                                Rename file
                            </span>
                        </div>
                    </button>

                </div>
            </div>

            {/* Divider */}
            <div className="flex flex-col items-start px-2.5 gap-2 w-full">
                <div className="w-full h-px bg-[#E8E5DF]" />
            </div>

            {/* User Profile Section */}
            <div className="flex flex-col items-start px-1 gap-2 w-full">
                <div className="flex flex-row items-center p-2 gap-3 w-full h-[56px] rounded-[8px]">
                    <div className="flex flex-col justify-center items-start gap-0.5 flex-1">
                        <span className="font-sans font-semibold text-[14px] leading-[20px] tracking-[-0.01em] text-[#1C1C1C]">
                            {user?.name || "testing2"}
                        </span>
                        <span className="font-sans font-normal text-[12px] leading-[150%] tracking-[-0.01em] text-[#8B8B8B]">
                            {user?.email || "testing2@gmail.com"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Credits Section */}
            <div className="flex flex-col items-start px-2.5 gap-2 w-full">
                <div className="flex flex-col items-start justify-center p-2 gap-2 w-full bg-[#F8F8F5] rounded-[8px]">

                    {/* Credits Header */}
                    <div className="flex flex-row items-start w-full h-[40px]">
                        {/* Left: Credits title */}
                        <div className="flex flex-col justify-center items-start gap-0.5 flex-1 h-full">
                            <span className="font-sans font-normal text-[12px] leading-[150%] text-[#8B8B8B]">
                                Credits
                            </span>
                            <span className="font-sans font-medium text-[14px] leading-[20px] text-[#09090B]">
                                20 left
                            </span>
                        </div>

                        {/* Right: Renews in */}
                        <div className="flex flex-col justify-center items-end gap-0.5 flex-1 h-full">
                            <span className="font-sans font-normal text-[12px] leading-[150%] text-right text-[#8B8B8B]">
                                Renews in
                            </span>
                            <span className="font-sans font-medium text-[14px] leading-[20px] text-right text-[#09090B]">
                                6h 24m
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-[#E8E5DF] rounded-[4px] overflow-hidden">
                        <div className="w-[62%] h-full bg-[#1E9A80] rounded-[4px]" />
                    </div>

                    {/* Footer */}
                    <div className="flex flex-row justify-between items-center w-full h-[20px]">
                        <span className="font-sans font-normal text-[12px] leading-[167%] tracking-[-0.01em] text-[#5F5F5D]">
                            5 of 25 used today
                        </span>
                        <span className="font-sans font-normal text-[12px] leading-[150%] text-[#1E9A80]">
                            +25 tomorrow
                        </span>
                    </div>

                </div>
            </div>

            {/* Divider */}
            <div className="flex flex-col items-start px-2.5 gap-2 w-full mt-1">
                <div className="w-full h-px bg-[#E8E5DF]" />
            </div>

            {/* Bottom Actions Section */}
            <div className="flex flex-col items-start px-1 gap-2 w-full pb-1">

                {/* Win free credits */}
                <button className="flex flex-col justify-center items-start p-1.5 gap-2 w-full h-[40px] rounded-[8px] hover:bg-gray-50 transition-colors">
                    <div className="flex flex-row items-center gap-2 w-full h-[28px]">
                        <div className="flex flex-row items-center p-1.5 gap-2.5 w-[28px] h-[28px] bg-[#F3F3EE] rounded-[6px]">
                            <img
                                src="/icons/gift.svg"
                                alt="Gift"
                                width={16}
                                height={16}
                                className="w-4 h-4"
                            />
                        </div>
                        <span className="font-sans font-medium text-[14px] leading-[20px] tracking-[-0.01em] text-[#1C1C1C]">
                            Win free credits
                        </span>
                    </div>
                </button>

                {/* Theme Style */}
                <button className="flex flex-col justify-center items-start p-1.5 gap-2 w-full h-[40px] rounded-[8px] hover:bg-gray-50 transition-colors">
                    <div className="flex flex-row items-center gap-2 w-full h-[28px]">
                        <div className="flex flex-row items-center p-1.5 gap-2.5 w-[28px] h-[28px] bg-[#F3F3EE] rounded-[6px]">
                            <Image
                                src="/icons/sun.svg"
                                alt="Theme"
                                width={16}
                                height={16}
                                className="w-4 h-4"
                            />
                        </div>
                        <span className="font-sans font-medium text-[14px] leading-[20px] tracking-[-0.01em] text-[#1C1C1C]">
                            Theme Style
                        </span>
                    </div>
                </button>

                {/* Log out */}
                <button
                    onClick={onLogout}
                    className="flex flex-col justify-center items-start p-1.5 gap-2 w-full h-[40px] rounded-[8px] hover:bg-gray-50 transition-colors"
                >
                    <div className="flex flex-row items-center gap-2 w-full h-[28px]">
                        <div className="flex flex-row items-center p-1.5 gap-2.5 w-[28px] h-[28px] bg-[#F3F3EE] rounded-[6px]">
                            <img
                                src="/icons/logout.svg"
                                alt="Logout"
                                width={16}
                                height={16}
                                className="w-4 h-4"
                            />
                        </div>
                        <span className="font-sans font-medium text-[14px] leading-[20px] tracking-[-0.01em] text-[#1C1C1C]">
                            Log out
                        </span>
                    </div>
                </button>

            </div>
        </div>
    );
}
