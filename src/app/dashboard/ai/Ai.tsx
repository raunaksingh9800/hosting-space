"use client";

import { useSite } from "@/context/SiteContext";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Save,
  ChevronDown,
  ExternalLink,
  Check,
  Code,
  ArrowUp,
  Share2,
  Copy,
  CheckCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import QRCode from "qrcode";

// Type definitions for better TypeScript support
interface ChatMessage {
  type: "user" | "assistant";
  content: string;
  timestamp: number;
  isLoading?: boolean;
}

interface Site {
  id: string;
  name: string;
  routeName: string;
}

// Skeleton Components
const TopBarSkeleton = () => (
  <div className="flex justify-between items-center mb-5">
    <div className="h-6 w-40 bg-gray-400/20 rounded animate-pulse" />
    <div className="flex items-center gap-4">
      <div className="h-5 w-5 bg-gray-400/20 rounded animate-pulse" />
      <div className="h-5 w-5 bg-gray-400/20 rounded animate-pulse" />
      <div className="h-5 w-5 bg-gray-400/20 rounded animate-pulse" />
      <div className="h-10 w-24 bg-gray-400/20 rounded animate-pulse" />
    </div>
  </div>
);

const ChatPanelSkeleton = () => (
  <div className="flex flex-col w-full md:w-1/3 items-end justify-end border rounded-lg px-4 bg-white/5 shadow-sm">
    <div className="overflow-y-auto flex flex-col h-full w-full mb-6 items-start mt-6 gap-4">
      <div className="w-full flex justify-end">
        <div className="h-16 w-3/4 bg-gray-400/10 rounded animate-pulse" />
      </div>
      <div className="w-full flex justify-start">
        <div className="h-20 w-2/3 bg-gray-400/10 rounded animate-pulse" />
      </div>
      <div className="w-full flex justify-end">
        <div className="h-12 w-3/5 bg-gray-400/10 rounded animate-pulse" />
      </div>
    </div>
    <div className="w-full mb-4 pt-4 border-t">
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-gray-400/10 rounded animate-pulse" />
        <div className="h-10 w-20 bg-gray-400/10 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

const PreviewPanelSkeleton = () => (
  <div className="w-full md:w-2/3 h-[100vh] md:h-full">
    <div className="w-full h-full rounded-lg border shadow-sm bg-gray-100 dark:bg-white/5 p-8 flex flex-col gap-4">
      <div className="h-12 bg-gray-400/10 rounded animate-pulse" />
      <div className="h-32 bg-gray-400/10 rounded animate-pulse" />
      <div className="flex-1 bg-gray-400/10 rounded animate-pulse" />
      <div className="h-20 bg-gray-400/10 rounded animate-pulse" />
    </div>
  </div>
);

export default function AiPage() {
  const searchParams = useSearchParams();
  const { sites, setSites, selectedSite, setSelectedSite, html, setHtml } =
    useSite();

  const [iframeKey, setIframeKey] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSiteLoading, setIsSiteLoading] = useState(false);
  
  // FIX 1: Corrected Generic Syntax
  const [publishState, setPublishState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    const loadSites = async () => {
      setIsInitialLoading(true);
      try {
        const res = await fetch("/api/dashboard/sites");
        const data = await res.json();
        setSites(data);

        const siteName = searchParams.get("site");
        if (siteName) {
          const matched = data.find((s: Site) => s.name === siteName);
          if (matched) {
            setIsSiteLoading(true);
            setTimeout(async () => {
              await handleSelect(matched);
              setIsSiteLoading(false);
            }, 0);
          }
        }
      } catch (err) {
        console.error("Failed to fetch sites", err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadSites();
  }, []);

  const handleSelect = async (site: Site) => {
    setIsSiteLoading(true);
    setSelectedSite(site as any);
    try {
      const response = await fetch(`/${site.routeName}`);
      const htmlContent = await response.text();
      setHtml(htmlContent);
      setIframeKey((k) => k + 1);
    } catch (error) {
      console.error("Failed to load site HTML:", error);
    } finally {
      setIsSiteLoading(false);
    }
  };

  const handleSendPrompt = async () => {
    if (!prompt.trim() || !selectedSite) return;

    const userMessage: ChatMessage = {
      type: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    const loadingMessage: ChatMessage = {
      type: "assistant",
      content: "",
      isLoading: true,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, userMessage, loadingMessage]);
    setLoading(true);

    try {
      const response = await fetch("/api/editwithai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          existingHtml: html,
          editPrompt: prompt,
          name: selectedSite.name,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to edit HTML");
      }

      setHtml(data.html);
      setIframeKey((prev) => prev + 1);

      setChatMessages((prev) => {
        const messages = [...prev];
        messages[messages.length - 1] = {
          type: "assistant",
          content:
            data.message || "I've successfully made the changes you requested.",
          timestamp: Date.now(),
          isLoading: false,
        };
        return messages;
      });
    } catch (error) {
      console.error("Error:", error);

      setChatMessages((prev) => {
        const messages = [...prev];
        messages[messages.length - 1] = {
          type: "assistant",
          content:
            "Sorry, there was an error processing your request. Please try again.",
          timestamp: Date.now(),
          isLoading: false,
        };
        return messages;
      });
    } finally {
      setLoading(false);
      setPrompt("");
    }
  };

  const handlePublish = async () => {
    if (!selectedSite) {
      alert("No site selected");
      return;
    }

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

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      setPublishState("success");
      setTimeout(() => setPublishState("idle"), 2000);
    } catch (err) {
      console.error("Publish error:", err);
      setPublishState("error");
      setTimeout(() => setPublishState("idle"), 2000);
    }
  };

  const getShareUrl = () => {
    if (!selectedSite) return "";

    const isLocalhost =
      typeof window !== "undefined" && window.location.hostname === "localhost";
    const baseUrl = isLocalhost
      ? `http://localhost:3000`
      : `https://hosting-space.vercel.app`;

    return `${baseUrl}/${selectedSite.routeName}`;
  };

  const handleShare = async () => {
    if (!selectedSite) return;

    const shareUrl = getShareUrl();

    try {
      const qrCode = await QRCode.toDataURL(shareUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrCodeUrl(qrCode);
      setShareModalOpen(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const handleCopyToClipboard = async () => {
    const shareUrl = getShareUrl();

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBarSkeleton />
        <div className="min-h-screen h-auto md:min-h-0 md:h-[70vh] w-full gap-6 rounded">
          <div className="w-full h-full flex flex-col md:flex-row-reverse gap-6">
            <ChatPanelSkeleton />
            <PreviewPanelSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2 font-semibold">
          {isSiteLoading ? (
            <div className="h-6 w-40 bg-gray-400/20 rounded animate-pulse" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer hover:text-blue-600 transition-colors">
                  <span>{selectedSite?.name || "Select Project"}</span>
                  <ChevronDown className="ml-1 mt-[2px]" size={16} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="ml-8">
                {sites.map((site) => (
                  <DropdownMenuItem
                    key={site.id}
                    onClick={() => handleSelect(site as any)}
                    className="cursor-pointer"
                  >
                    {site.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              {selectedSite && (
                <button
                  onClick={handleShare}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                  aria-label="Share project"
                  disabled={isSiteLoading}
                >
                  <Share2 size={20} />
                </button>
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p>Share</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              {/* FIX 2: Added missing opening <a> tag */}
              <a
                href={`/dashboard/IDE?site=${selectedSite?.name}`}
                className="opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Open Code Editor"
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
              {/* FIX 3: Added missing opening <a> tag */}
              <a
                href={
                  selectedSite ? `/${selectedSite.routeName}` : "/dev/preview"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Open Preview in new tab"
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
            disabled={publishState === "loading" || !selectedSite || isSiteLoading}
            className={`
              transition-colors duration-300
              ${
                publishState === "success"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : ""
              }
              ${
                publishState === "error"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : ""
              }
            `}
          >
            {publishState === "loading" && (
              <svg
                className="animate-spin h-4 w-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
                Published <Check size={16} />
              </div>
            )}
            {publishState === "error" && "Error"}
            {publishState === "idle" && (
              <div className="flex items-center gap-1">
                Save <Save size={16} />
              </div>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Project</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {qrCodeUrl && (
              <div className="p-4 rounded-lg">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>
            )}

            <div className="w-full">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={getShareUrl()}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
                <Button
                  onClick={handleCopyToClipboard}
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen h-auto md:min-h-0 md:h-[70vh] w-full gap-6 rounded">
        <div className="w-full h-full flex flex-col md:flex-row-reverse gap-6">
          {isSiteLoading ? (
            <>
              <ChatPanelSkeleton />
              <PreviewPanelSkeleton />
            </>
          ) : (
            <>
              <div className="flex flex-col w-full md:w-1/3 items-end justify-end border rounded-lg px-4 bg-white/5 shadow-sm">
                <div
                  ref={scrollRef}
                  className="overflow-y-auto backdrop-blur-md flex flex-col h-full w-full mb-6 items-start mt-6 gap-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                >
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`w-full ${
                        message.type === "user"
                          ? "flex justify-end"
                          : "flex justify-start"
                      }`}
                    >
                      {message.type === "user" ? (
                        <div className="text-right text-sm border-r-2 border-white pr-4 py-3 max-w-[80%]">
                          {message.content}
                        </div>
                      ) : (
                        <div className="relative pl-3 py-3 text-left text-sm max-w-[80%] rounded-r-lg rounded-tl-lg">
                          <div
                            className={`absolute left-0 top-0 h-full w-[2px] ${
                              message.isLoading ? "animate-pulse" : ""
                            } bg-gradient-to-b from-[#FF6F6F] to-[#147EFF] rounded-full`}
                          ></div>
                          <div className="pl-2">
                            {message.isLoading ? (
                              <div className="flex items-center gap-2 animate-pulse">
                                Thinking
                              </div>
                            ) : (
                              <div>
                                <div className="whitespace-pre-wrap">
                                  {message.content}
                                </div>
                                {message.timestamp && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    {new Date(
                                      message.timestamp
                                    ).toLocaleTimeString()}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="w-full mb-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Describe the change you want..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyPress}
                      disabled={loading || !selectedSite}
                      className="flex-1"
                      aria-label="Chat input"
                    />
                    <Button
                      onClick={handleSendPrompt}
                      variant="outline"
                      disabled={!prompt.trim() || loading || !selectedSite}
                      className="shrink-0 min-w-[80px]"
                      aria-label="Send message"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <ArrowUp size={16} />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-2/3 h-[100vh] md:h-full">
                {selectedSite ? (
                  <iframe
                    key={iframeKey}
                    title="Website Preview"
                    srcDoc={html}
                    sandbox="allow-scripts allow-same-origin allow-modals allow-forms"
                    className="w-full h-full rounded-lg border shadow-sm"
                    style={{ backgroundColor: "white" }}
                  />
                ) : (
                  <div className="w-full h-full rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <div className="text-center text-gray-500">
                      <Code size={48} className="mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">
                        No Project Selected
                      </h3>
                      <p className="text-sm">
                        Select a project from the dropdown to start editing
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}