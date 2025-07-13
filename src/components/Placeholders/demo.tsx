"use client";

import { PlaceholdersAndVanishInput } from "../ui/placeholders-and-vanish-input";
import { SparklesCore } from "@/components/ui/sparkles";

export function PlaceholdersAndVanishInputDemo() {
  const placeholders = [
    "Build a liquid glass calculator",
    "Weather app",
    "ESP32 dashboard to control a light",
    "Write a Javascript method to reverse a string",
    "Portfolio website",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
  };
  return (
    <div className="h-[40rem] flex flex-col justify-center  items-center px-4">
      <h2 className="mb-6 md:mb-10 text-3xl relative -top-16  md:top-0 text-center sm:text-5xl  dark:text-white text-black">
        Build Anything, Anywhere
      </h2>

      <div className="w-full absolute inset-0 -z-40 h-screen">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.8}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#fff"
        />
      </div>
      <div className=" relative -top-16 w-full  md:top-0">
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleChange}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
