"use client";

import { useSite } from "@/context/SiteContext";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  ChevronDown,
  ExternalLink,
  Check,
  Globe,
  Code,

  ArrowUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AiPage() {
  const searchParams = useSearchParams();
  const { sites, setSites, selectedSite, setSelectedSite, html, setHtml } =
    useSite();

  const [iframeKey, setIframeKey] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishState, setPublishState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  useEffect(() => {
    const loadSites = async () => {
      try {
        const res = await fetch("/api/dashboard/sites");
        const data = await res.json();
        setSites(data);

        const siteName = searchParams.get("site");
        if (siteName) {
          const matched = data.find((s: any) => s.name === siteName);
          if (matched) {
            setTimeout(() => {
              handleSelect(matched);
            }, 4000);
          }
        }
      } catch (err) {
        console.error("Failed to fetch sites", err);
      }
    };

    loadSites();
  }, []);

  const handleSelect = async (site: (typeof sites)[number]) => {
    setSelectedSite(site);
    const html = await fetch(`/${site.routeName}`).then((r) => r.text());
    setHtml(html);
    setIframeKey((k) => k + 1);
  };

  const handleSendPrompt = async () => {
    if (!selectedSite || !prompt.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/editwithai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          existingHtml: html,
          editPrompt: prompt,
          name: selectedSite.name, // IMPORTANT: must match DB value
        }),
      });

      const data = await res.json();

      if (res.ok && data.html) {
        setHtml(data.html);
        setIframeKey((k) => k + 1);
        setPrompt(""); // Clear prompt after success
      } else {
        console.error(data.error);
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedSite) return alert("No site selected");
    setPublishState("loading");

    try {
      const res = await fetch("/api/updatecode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeName: selectedSite.routeName,
          code: html,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setPublishState("success");
      setTimeout(() => setPublishState("idle"), 2000);
    } catch (err) {
      console.error(err);
      setPublishState("error");
      setTimeout(() => setPublishState("idle"), 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2 font-semibold">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center cursor-pointer">
                <span>{selectedSite?.name || "Select Project"}</span>
                <ChevronDown className="ml-1 mt-[2px]" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="ml-8">
              {sites.map((site) => (
                <DropdownMenuItem
                  key={site.id}
                  onClick={() => handleSelect(site)}
                >
                  {site.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={`/dashboard/IDE?site=${selectedSite?.name}`}
                className="opacity-60 hover:opacity-100 transition"
              >
                <Code size={20} />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open Code Editor</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              {selectedSite && (
                <a
                  href={`/${selectedSite.routeName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-60 hover:opacity-100 transition"
                >
                  <Globe size={20} />
                </a>
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p>Project Link</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="/dev/preview"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-60 hover:opacity-100 transition"
              >
                <ExternalLink size={20} />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open Preview in new tab</p>
            </TooltipContent>
          </Tooltip>

          <Button
            onClick={handlePublish}
            disabled={publishState === "loading"}
            className={`
              transition-colors duration-300
              ${publishState === "success" ? "bg-green-600 text-white" : ""}
              ${publishState === "error" ? "bg-red-600 text-white" : ""}
            `}
          >
            {publishState === "loading" && (
              <svg
                className="animate-spin h-4 w-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}
            {publishState === "success" && (
              <div className="flex items-center gap-1">
                Published <Check />
              </div>
            )}
            {publishState === "error" && "Error"}
            {publishState === "idle" && (
              <>
                Publish <Cloud />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-col h-[90vh] md:flex-row gap-6 rounded">
        <div className="flex-1 rounded shadow-sm">
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Describe the change you want..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
            />
            <Button
              onClick={handleSendPrompt}
              variant={"outline"}
              disabled= {!prompt.trim()}
            >
              {loading ? (
                <>
                  <h1 className="text-center">
                    
                    <span className=" animate-pulse bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent font-semibold">
                      Thinking
                    </span>
                  </h1>
                </>
              ) : (
                <>
                  <ArrowUp />
                </>
              )}
            </Button>
          </div>

          <iframe
            key={iframeKey}
            title="preview"
            srcDoc={html}
            sandbox="allow-scripts allow-same-origin allow-modals"
            className="w-full rounded h-full"
          />
        </div>
      </div>
    </div>
  );
}
