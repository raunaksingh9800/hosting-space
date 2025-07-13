"use client"
import React from "react";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { ChevronRight, LogIn } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { SignUpButton, SignedOut, SignedIn } from "@clerk/nextjs";

export default function Navbar() {
  const { isLoaded } = useUser();

  if (!isLoaded) return null;
  return (
    <nav className="w-screen  h-10 flex flex-row      justify-between items-center px-4 md:px-32 mt-10  mb-7 md:mb-5">
      <div className=" flex flex-row backdrop-blur-xs  bg-white/5 border py-3   w-full justify-between items-center rounded-2xl">
        {" "}
        <div className="text-lg pl-4">
          Hosting <strong>Space</strong>
        </div>
        <div className="flex flex-row gap-0 md:pr-4 md:gap-1">
          <ModeToggle />
          {/* Show Sign In if signed out */}
          <SignedOut>
            <SignUpButton
              signInFallbackRedirectUrl="/dashboard"
              forceRedirectUrl="/dashboard"
              signInForceRedirectUrl="/dashboard"
              fallbackRedirectUrl="/dashboard"
            >
              <Button variant={"ghost"}>
                Sign In
                <LogIn className=" h-4 w-4" />
              </Button>
            </SignUpButton>
          </SignedOut>

          {/* Show Dashboard button if signed in */}
          <SignedIn>
            <Button
              variant={"ghost"}
              onClick={() => (window.location.href = "/dashboard")}
            >
              Go to dashboard
              <ChevronRight className=" h-4 w-4" />
            </Button>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
