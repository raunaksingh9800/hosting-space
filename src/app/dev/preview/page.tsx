"use client";

import { useEffect, useState } from "react";

export default function FullPreviewPage() {
  const [code, setCode] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("preview-code");
    if (saved) setCode(saved);
  }, []);

  if (!code) {
    return (
      <div className="flex items-center justify-center h-screen text-sm text-muted-foreground">
        No preview available.
      </div>
    );
  }

  return (
    <iframe
      title="preview"
      srcDoc={code}
      sandbox="allow-scripts allow-same-origin allow-modals"
      className="w-full h-screen border-none"
    />
  );
}
