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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Editor from "@monaco-editor/react";
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
  Sparkles,
  Share2,
  Copy,
  CheckCircle,
} from "lucide-react";
import QRCode from "qrcode";

export default function IDE() {
  const searchParams = useSearchParams();
  const { sites, setSites, selectedSite, setSelectedSite, html, setHtml } =
    useSite();

  const [code, setCode] = useState(html);
  const [iframeKey, setIframeKey] = useState(0);
  const [publishState, setPublishState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Fetch all sites & optionally load one by name from query
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
            }, 4000); // 4s delay before loading site
          }
        }
      } catch (err) {
        console.error("Failed to fetch sites", err);
      }
    };

    loadSites();
  }, []);

  // Update editor & preview when HTML changes
  useEffect(() => {
    setCode(html);
    setIframeKey((k) => k + 1);
  }, [html]);

  const handleSelect = async (site: (typeof sites)[number]) => {
    setSelectedSite(site);
    const html = await fetch(`/${site.routeName}`).then((r) => r.text());
    setHtml(html);
  };

  const handleSave = () => {
    localStorage.setItem("preview-code", code);
    setIframeKey((k) => k + 1);
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
          code,
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

  const getShareUrl = () => {
    if (!selectedSite) return "";
    
    // Check if we're in development or production
    const isLocalhost = window.location.hostname === "localhost";
    const baseUrl = isLocalhost 
      ? `http://localhost:3000` 
      : `https://hosting-space.vercel.app`;
    
    return `${baseUrl}/${selectedSite.routeName}`;
  };

  const handleShare = async () => {
    if (!selectedSite) return;
    
    const shareUrl = getShareUrl();
    
    try {
      // Generate QR code
      const qrCode = await QRCode.toDataURL(shareUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#ffffff',
          light: '#000'
        }
      });
      setQrCodeUrl(qrCode);
      setShareModalOpen(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleCopyToClipboard = async () => {
    const shareUrl = getShareUrl();
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [code]);

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
              {selectedSite && (
                <button
                  onClick={handleShare}
                  className="opacity-60 hover:opacity-100 transition"
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
              {selectedSite && (
                <a
                  href={`/dashboard/ai?site=${selectedSite.name}`}
                  className="opacity-60 hover:opacity-100 transition"
                >
                  <Sparkles size={20} />
                </a>
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit with Ai</p>
            </TooltipContent>
          </Tooltip>


          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="/dev/preview"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleSave}
                className="opacity-60 hover:opacity-100 transition"
              >
                <ExternalLink size={20} />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open Privew in new tab</p>
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
                Save <Save />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Share Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Project</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {/* QR Code */}
            {qrCodeUrl && (
              <div className=" p-4 rounded-lg">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>
            )}
            
            {/* URL Display */}
            <div className="w-full">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={getShareUrl()}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-md  text-sm"
                />
                <Button
                  onClick={handleCopyToClipboard}
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 " />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main layout */}
      <div className="flex flex-col md:flex-row gap-6 rounded h-[80vh]">
        {/* Editor */}
        <div className="flex-1 flex flex-col min-h-[250px] max-h-full shadow-sm">
          <div className="bg-black/10 rounded-t dark:bg-white/10 text-xs px-3 py-1 font-mono border-b border-black/20 dark:border-white/20">
            html
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language="html"
              value={code}
              onChange={(v) => setCode(v || "")}
              className="rounded-b overflow-hidden"
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                wordWrap: "on",
                scrollbar: { verticalScrollbarSize: 4 },
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-1 min-h-[250px] max-h-full rounded bg-white/5 shadow-sm">
          <iframe
            key={iframeKey}
            title="preview"
            srcDoc={code}
            sandbox="allow-scripts allow-same-origin allow-modals"
            className="w-full h-full rounded"
          />
        </div>
      </div>
    </div>
  );
}