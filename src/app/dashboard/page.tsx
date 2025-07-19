"use client";

import {
  Globe,
  Sparkles,
  Server,
  Activity,
  Rocket,
  Cloud,
  Ellipsis,
  Check,
  X,
  Code,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSite } from "@/context/SiteContext";

const icons = [Globe, Server, Activity, Rocket, Cloud];

export default function OverviewPage() {
  const { sites, setSites, setSelectedSite, setHtml } = useSite();
  const [loading, setLoading] = useState(true); // <- New loading state

  useEffect(() => {
    const loadAndRedirect = async () => {
      try {
        const res = await fetch("/api/dashboard/sites");
        const data = await res.json();
        setSites(data);
        setLoading(false); // <- Stop loading after data fetched

        if (data.length > 0) {
          setSelectedSite(data[0]);
          const html = await fetch(`/${data[0].routeName}`).then((r) =>
            r.text()
          );
          setHtml(html);
        }

        const params = new URLSearchParams(window.location.search);
        const openSite = params.get("open_site");
        const openSiteMode = params.get("open_site_mode"); // can be "ai" or "IDE"

        if (openSite) {
          const match = data.find((site: any) => site.name === openSite);
          if (match) {
            const mode = openSiteMode === "ai" ? "ai" : "IDE";
            setTimeout(() => {
              window.location.href = `/dashboard/${mode}?site=${encodeURIComponent(
                match.name
              )}`;
            }, 1000);
            return;
          }
        }
      } catch (error) {
        console.error("Failed to load sites:", error);
        setLoading(false);
      }
    };

    loadAndRedirect();
  }, []);

  // Helper function to format date
  const formatDate = (dateString:string) => {
    const year = dateString.slice(0, 4);
    const month = dateString.slice(5, 7);
    const day = dateString.slice(8, 10);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${parseInt(day)} ${monthNames[parseInt(month) - 1]}`;
  };

  return (
    <div className="flex flex-col min-h-[75vh]">
      <h1 className="font-bold text-xs opacity-30">Projects</h1>

      {loading ? (
        // ✅ Loading animation (you can customize this)
        <div className="flex-1  flex items-center justify-center py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400 mx-auto" />
        </div>
      ) : sites.length === 0 ? (
        // ✅ Only show when not loading and no sites
        <div className="flex flex-1 items-center justify-center py-20 text-center">
          <div className="space-y-2">
            <div className="text-4xl">🚧</div>
            <div className="text-lg font-semibold opacity-60">
              No sites created yet
            </div>
            <div className="text-sm opacity-[42%]">
              Your deployed projects will appear here
            </div>
          </div>
        </div>
      ) : (
        // ✅ Sites grid
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
          {sites.map((site, i) => {
            const Icon = icons[i % icons.length];

            return (
              <div
                key={site.id}
                className="border backdrop-blur-md transition-all border-black/25 dark:border-white/25 border-dotted rounded-lg hover:dark:border-white/60 hover:border-black/80 hover:rounded-2xl px-5 py-5 flex flex-col"
              >
                <div className="w-full flex justify-between items-center">
                  <div className="flex items-center">
                    <Icon size={30} />
                    <div className="pl-3">
                      <div className="font-semibold text-sm">{site.name}</div>
                      <div className="text-xs opacity-40 hover:underline hover:cursor-pointer transition-all hover:opacity-60">
                        <a
                          href={`/${site.routeName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          hosting.space/{site.routeName}
                        </a>
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
                      <DropdownMenuItem
                        onClick={() => {
                          const route = site.buildType === "ai" ? "ai" : "IDE";
                          window.location.href = `/dashboard/${route}?site=${encodeURIComponent(
                            site.name
                          )}`;
                        }}
                      >
                        Open Project
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          window.location.href = `/${site.routeName}`;
                        }}
                      >
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          const confirmed = confirm(
                            `Are you sure you want to delete "${site.name}"?`
                          );
                          if (!confirmed) return;

                          const res = await fetch("/api/site/delete", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ routeName: site.routeName }),
                          });

                          if (res.ok) {
                            alert("Site deleted");
                            setSites(
                              sites.filter(
                                (s: typeof site) =>
                                  s.routeName !== site.routeName
                              )
                            );
                          } else {
                            const err = await res.json();
                            alert("Failed to delete: " + err.error);
                          }
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="w-full flex flex-col pt-6">
                  {site.buildType === "static" ? (
                    <div className="text-xs font-bold opacity-60 flex items-center gap-2">
                      <Code strokeWidth={2} size={16} /> Static Build
                    </div>
                  ) : site.buildType === "ai" ? (
                    <div className="text-xs font-bold opacity-60 flex items-center gap-2">
                      <Sparkles strokeWidth={2} size={16} /> Ai Build
                    </div>
                  ) : (
                    <div className="text-xs font-bold opacity-60 flex items-center gap-1 text-red-600 dark:text-red-200">
                      <X strokeWidth={3} size={16} /> {site.buildType}
                    </div>
                  )}
                  <div className="text-sm opacity-40 mt-1">
                    {formatDate(site.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}