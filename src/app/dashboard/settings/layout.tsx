"use client";
import { ChevronRight } from "lucide-react";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const links = [
    { href: "/dashboard/settings/ai", label: "Ai Integration" },
    { href: "/dashboard/settings/profile", label: "Profile" },
    { href: "/dashboard/settings/privacy", label: "Privacy" },
  ];

  return (
    <div className="w-full h-[70vh] flex flex-col lg:flex-row gap-4">
      {/* Navigation - horizontal on mobile, vertical on desktop */}
      <div className="w-full backdrop-blur-md lg:w-[20%] lg:h-full flex flex-row lg:flex-col gap-6 lg:gap-6 border rounded px-6 lg:px-4 py-6 lg:py-4 overflow-x-auto lg:overflow-x-visible">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-row text-sm hover:cursor-pointer transition-all items-center justify-between opacity-60 hover:font-medium hover:opacity-100 whitespace-nowrap lg:whitespace-normal ${
                isActive ? "font-bold text-black dark:text-white opacity-100" : ""
              }`}
            >
              {link.label} 
              <ChevronRight 
                strokeWidth={1.5} 
                size={18} 
                className="hidden lg:block ml-2" 
              />
            </Link>
          );
        })}
      </div>
      
      {/* Content area */}
      <div className="w-full lg:w-[80%] flex-1 lg:h-full border rounded backdrop-blur-md">
        {children}
      </div>
    </div>
  );
}