"use client";

// OverviewPage.tsx
import React, { useState, useEffect } from "react";
import { SelectComp } from "./components/selector";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, EyeOff } from "lucide-react";

interface AISettings {
  aiProvider: string | null;
  hasApiKey: boolean;
}

export default function OverviewPage() {
  const [provider, setProvider] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [existingSettings, setExistingSettings] = useState<AISettings | null>(
    null
  );

  // Fetch existing settings on component mount
  useEffect(() => {
    fetchExistingSettings();
  }, []);

  const fetchExistingSettings = async () => {
    try {
      const response = await fetch("/api/ownai");
      if (response.ok) {
        const data = await response.json();
        setExistingSettings(data);
        if (data.aiProvider) {
          setProvider(data.aiProvider);
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleSave = async () => {
    if (!provider || !apiKey) {
      setMessage({
        type: "error",
        text: "Please select a provider and enter an API key",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/ownai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aiProvider: provider,
          apiKey: apiKey,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "AI settings saved successfully!",
        });
        setApiKey(""); // Clear the input after successful save
        await fetchExistingSettings(); // Refresh the displayed settings
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to save settings",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred while saving settings",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/ownai", {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "AI settings removed successfully!",
        });
        setProvider("");
        setApiKey("");
        setExistingSettings(null);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to remove settings",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred while removing settings",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 2000);
  };

  useEffect(() => {
    if (message) {
      clearMessage();
    }
  }, [message]);

  return (
    <div className="w-full h-full flex flex-col py-6 px-8">
      {/* Page Title */}
      <div className="font-semibold text-2xl">Bring Your Own AI Key</div>

      {/* Description */}
      <div className="mt-4 text-sm opacity-60">
        Prefer using your own API key? You can connect your own AI provider
        instead of relying on the default. Your key will be used during site
        generation and deployment.
      </div>
      <div className="mt-2 text-sm opacity-60">
        Don't worry — your key is stored securely and never shared.
      </div>

      {/* Current Settings Display */}
      {existingSettings && existingSettings.hasApiKey && (
        <div className="mt-6 ">
          <div className="mb-2 text-sm font-semibold">Your API keys</div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0 md:gap-3">
                <div className="text-sm font-medium hidden md:block">Current Settings:</div>
                <Badge variant="outline" className="capitalize">
                  {existingSettings.aiProvider}
                </Badge>
                <Badge variant="secondary" className="">API Key Connected</Badge>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Removing..." : "Remove"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Form Section */}
      <div className="flex flex-col lg:flex-row w-full mt-8 gap-6">
        {/* Provider Selector */}
        <div className="flex flex-col">
          <div className="text-sm mb-3">Choose AI Provider</div>
          <SelectComp
            value={provider}
            onValueChange={setProvider}
            disabled={isLoading}
          />
        </div>

        {/* API Key Input */}
        <div className="flex flex-col w-full">
          <div className="text-sm mb-3">Your API Key</div>
          <div className="relative">
            <Input
              className="w-full pr-10"
              type={showApiKey ? "text" : "password"}
              placeholder="Paste your API key here"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 w-full flex justify-end">
        <Button
          className="px-6 py-2 text-sm font-medium"
          onClick={handleSave}
          disabled={isLoading || !provider || !apiKey}
        >
          {isLoading ? "Saving..." : "Save API Key"}
        </Button>
      </div>

      {/* Message Alert */}
      {message && (
        <div className=" fixed right-8 bottom-10 ">
                    <Alert
          className={`mt-4 ${
            message.type === "error" ? "border-red-500" : "border"
          }`}
        >
          <AlertDescription
            className={
              message.type === "error" ? "text-red-600" : "text-white"
            }
          >
            {message.text}
          </AlertDescription>
        </Alert>
        </div>
      )}
    </div>
  );
}
