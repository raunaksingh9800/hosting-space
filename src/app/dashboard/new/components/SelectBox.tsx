"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Code, Sparkles, LayoutPanelTop } from "lucide-react";

const options = [
  { label: "Custom Build", icon: Code },
  { label: "Create with AI", icon: Sparkles },
  { label: "Templates", icon: LayoutPanelTop },
];

export default function SelectBox() {
  const [selected, setSelected] = useState(1); // Default to "Create with AI"

  return (
    <div className="mt-5 flex flex-col gap-4">
      <label htmlFor="" className=" text-sm ">
        Build Type
      </label>
      <div className="w-full  h-[12vh] flex flex-row justify-between gap-3 rounded-md relative">
        {options.map((option, i) => {
          const Icon = option.icon;
          const isActive = selected === i;
          const isAI = option.label === "Create with AI";

          return (
            <button
              key={option.label}
              onClick={() => setSelected(i)}
              className={`relative flex flex-col w-1/3 h-full border border-black/30 dark:border-white/30 rounded-md justify-center items-center gap-2 text-sm font-medium transition-all duration-300 overflow-hidden ${
                isActive
                  ? "text-black dark:text-white"
                  : " text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
              }`}
            >
              {/* White border for other boxes */}
              {isActive && !isAI && (
                <motion.div
                  layoutId="highlight"
                  className="absolute inset-0 rounded-md border-2 border-black dark:border-white"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Animated gradient border for Create with AI */}
              {isActive && isAI && (
                <motion.div
                  layoutId="highlight"
                  className="absolute inset-0 p-[2px]  bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="w-full h-full bg-white rounded-[6px] text-black dark:text-white dark:bg-zinc-900" />
                </motion.div>
              )}

              <Icon className="z-10" />
              <span className="z-10">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
