"use client";

import React from "react";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import {
  SignUpButton,
  SignedOut,
  SignedIn,
} from "@clerk/nextjs";

export default function DashboardLayout({}: object) {
  const { isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) return null;

  return (
    <div>
      {/* Top Navbar */}
      <nav className="w-screen h-10 flex flex-row justify-between items-center px-5 md:px-10 mt-5 mb-7 md:mb-5">
        <div className="text-lg">
          Hosting <strong>Space</strong>
        </div>
        <div className="flex flex-row gap-4 md:gap-5">
          <ModeToggle />
          {/* Show Sign In if signed out */}
          <SignedOut>
            <SignUpButton signInFallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard" signInForceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
              <Button>
                Sign In
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </SignUpButton>
          </SignedOut>

          {/* Show Dashboard button if signed in */}
          <SignedIn>
            <Button onClick={() => router.push("/dashboard")}>
              Go to dashboard
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </SignedIn>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-screen h-[80vh] flex flex-col justify-center items-center">
        <h1 className="text-3xl">
          Your all in the one <strong>Hosting</strong>
        </h1>
      </div>
    </div>
  );
}
