
import React from "react";

import { PlaceholdersAndVanishInputDemo } from "@/components/Placeholders/demo";
import Navbar from "@/components/NavBar/navbar";

export default function DashboardLayout({}: object) {


  return (
    <div>
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="w-screen h-[80vh] flex flex-col justify-center items-center">
        <PlaceholdersAndVanishInputDemo />
      </div>
    </div>
  );
}
