"use client";

import {
  Globe,
  Server,
  Activity,
  Rocket,
  Cloud,
  Ellipsis,
  Check,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const icons = [Globe, Server, Activity, Rocket, Cloud];
const names = [
  "Apollo", "Nebula", "Orion", "Zephyr", "Phoenix",
  "Vortex", "Drift", "Cosmo", "Nimbus", "Luna",
];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(): string {
  const day = Math.floor(Math.random() * 20) + 10;
  return `Jun ${day}`;
}

type Project = {
  name: string;
  Icon: React.ElementType;
  status: "ready" | "failed";
  date: string;
};

export default function OverviewPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 20 }, () => ({
      name: getRandom(names),
      Icon: getRandom(icons),
      status: Math.random() > 0.3 ? "ready" : "failed",
      date: getRandomDate(),
    })) as Project[];
    setProjects(generated);
  }, []);

  return (
    <div className="flex flex-col">
      <h1 className="font-bold text-xs opacity-30">Projects</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
        {projects.map(({ Icon, name, status, date }, i) => (
          <div
            key={i}
            className="border transition-all border-black/25 dark:border-white/25 border-dotted rounded-lg hover:dark:border-white/60 hover:border-black/80 hover:rounded-2xl px-5 py-5 flex flex-col"
          >
            <div className="w-full flex flex-row justify-between items-center">
              <div className="flex flex-row items-center">
                <Icon size={30} />
                <div className="pl-3">
                  <div className="font-semibold text-sm">{name}</div>
                  <div className="text-xs opacity-40 hover:underline hover:cursor-pointer transition-all hover:opacity-60">
                    hosting.space/{name.toLowerCase()}
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded opacity-60 hover:cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-all">
                    <Ellipsis size={22} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Open Project</DropdownMenuItem>
                  <DropdownMenuItem>Preview</DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="w-full flex flex-col pt-6">
              {status === "ready" ? (
                <div className="text-xs font-bold opacity-60 flex flex-row items-center gap-1 ">
                  <Check strokeWidth={3} size={16} /> Build Ready
                </div>
              ) : (
                <div className="text-xs font-bold opacity-60 flex flex-row items-center gap-1 text-red-600 dark:text-red-200">
                  <X strokeWidth={3} size={16} /> Build Failed
                </div>
              )}
              <div className="text-sm opacity-40 mt-1">{date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
