"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Cloudy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import {

  SignedIn,
  
  UserButton,
} from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/ai", label: "AI" },
    { href: "/dashboard/integration", label: "Integration" },
    { href: "/dashboard/support", label: "Support" },
    { href: "/dashboard/plans", label: "Plans" },
    { href: "/dashboard/settings", label: "Settings" },
  ];

  return (
    <div>
      {/* Top Navbar */}
      <nav className="w-screen h-10 flex flex-row justify-between items-center px-5 md:px-10 mt-5 mb-7 md:mb-5">
        <div className="text-lg">
          Hosting <strong>Space</strong>
        </div>
        <div className="flex flex-row gap-4 md:gap-5">
          <ModeToggle />

          <Badge className="hidden md:flex" variant="outline">Free Tier</Badge>
          <Button
          className="hidden md:flex"
            variant={"outline"}
          >
            Upgrade <Cloudy />
          </Button>

          <Button
            onClick={() => {
              window.location.href = "/dashboard/new";
            }}
          >
            Add New <Plus />
          </Button>

          <div className="flex flex-col items-center justify-center">
              <SignedIn>
                <UserButton />
              </SignedIn>
          </div>

        </div>
      </nav>

      {/* Animated Tabs */}
      <div className="relative flex flex-row gap-6 overflow-x-scroll text-sm mx-5 md:mx-10  text-black/40 dark:text-white/40">
        {links.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`relative pb-3 transition-colors ${
                isActive
                  ? "text-black dark:text-white font-bold"
                  : "hover:text-black dark:hover:text-white"
              }`}
            >
              {label}
              {isActive && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-black dark:bg-white"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Page Content */}
      <div className=" mx-5 md:mx-10 mt-5">{children}</div>
      <footer className="w-screen h-[20vh] border-t-1 border-dashed border-black/20 dark:border-white/20  mt-10"></footer>
    </div>
  );
}
