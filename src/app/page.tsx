"use client";

import React from "react";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import {  ChevronRight } from "lucide-react";


export default function DashboardLayout({}: object) {

  return (
    <div>
      {/* Top Navbar */}
      <nav className="w-screen h-10 flex flex-row justify-between items-center px-5 md:px-10 mt-5 mb-7 md:mb-5">
        <div className="text-lg">
          Hosting <strong>Space</strong>
        </div>
        <div className="flex flex-row gap-4 md:gap-5">

        <ModeToggle />
          <Button
            onClick={() => {
              window.location.href = "/dashboard";
            }}
          >
            Go to dashboard <ChevronRight /> 
          </Button>

        </div>
      </nav>

      {/* Animated Tabs */}
        
        <div className="w-screen h-[80vh] flex flex-col justify-center items-center">

         <h1 className=" text-3xl"> Your all in the one <strong>Hosting</strong></h1> 
        </div>

      {/* Page Content */}
      
    </div>
  );
}
