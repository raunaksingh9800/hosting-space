"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type Site = {
  id: number;
  routeName: string;
  buildType: string;
  createdAt: string;
  name: string;
};

type SiteContextType = {
  sites: Site[];
  selectedSite: Site | null;
  html: string;
  setSites: (sites: Site[]) => void;
  setSelectedSite: (site: Site) => void;
  setHtml: (html: string) => void;
};

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [sites, setSitesState] = useState<Site[]>([]);
  const [selectedSite, setSelectedSiteState] = useState<Site | null>(null);
  const [html, setHtmlState] = useState("");

  // SETTERS + localStorage
  const setSites = (newSites: Site[]) => {
    setSitesState(newSites);
    localStorage.setItem("sites", JSON.stringify(newSites));
  };

  const setSelectedSite = (site: Site) => {
    setSelectedSiteState(site);
    localStorage.setItem("selectedSite", JSON.stringify(site));
  };

  const setHtml = (newHtml: string) => {
    setHtmlState(newHtml);
    localStorage.setItem("html", newHtml);
  };

  // Restore on mount
  useEffect(() => {
    try {
      const storedSites = localStorage.getItem("sites");
      const storedSelectedSite = localStorage.getItem("selectedSite");
      const storedHtml = localStorage.getItem("html");

      if (storedSites) setSitesState(JSON.parse(storedSites));
      if (storedSelectedSite) setSelectedSiteState(JSON.parse(storedSelectedSite));
      if (storedHtml) setHtmlState(storedHtml);
    } catch (err) {
      console.error("Failed to restore context from localStorage:", err);
    }
  }, []);

  return (
    <SiteContext.Provider
      value={{ sites, selectedSite, html, setSites, setSelectedSite, setHtml }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error("useSite must be used within SiteProvider");
  return context;
}
