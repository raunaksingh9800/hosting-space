"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SelectBox from "./SelectBox";

type Step1Props = {
  projectName: string;
  setProjectName: (v: string) => void;
  route: string;
  setRoute: (v: string) => void;
  buildTypeIndex: number;
  setBuildTypeIndex: (i: number) => void;
  onNext: () => void;
  routeStatus: "idle" | "checking" | "available" | "taken" | "invalid";
};

export default function Step1({
  projectName,
  setProjectName,
  route,
  setRoute,
  onNext,
  buildTypeIndex,
  setBuildTypeIndex,
  routeStatus,
}: Step1Props) {
  return (
    <>
      <h1 className="text-2xl md:text-3xl mt-2 md:mt-5 text-center">
        Let's Build Something{" "}
        <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent font-semibold">
          Amazing.
        </span>
      </h1>
      <div className="mt-10 flex flex-col gap-3">
        <label className="text-sm">Project Name</label>
        <Input
          type="text"
          placeholder="e.g. Hobby"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <label className="text-sm">Route Name</label>
        <Input
          type="text"
          placeholder="world"
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          className={routeStatus === "invalid" ? "border-red-400 focus:border-red-400" : ""}
        />
        <label className="text-sm flex flex-row">
          <div className="opacity-40">Your URL will be&nbsp;</div>
          <strong className="opacity-80">
            hosting.space/{route}{" "}
            {route && (
              <>
                {routeStatus === "checking" && "Checking..."}
                {routeStatus === "available" && <span className="text-green-400">is available</span>}
                {routeStatus === "taken" && <span className="text-red-400">is taken</span>}
                {routeStatus === "invalid" && (
                  <span className="text-red-400">
                    contains invalid characters
                  </span>
                )}
              </>
            )}{" "}
          </strong>
        </label>
        {routeStatus === "invalid" && (
          <p className="text-sm opacity-60">
            Route name can only contain letters, numbers, and hyphens (-)
          </p>
        )}
      </div>
      <SelectBox selected={buildTypeIndex} onChange={setBuildTypeIndex} />
      <div className="w-full h-fit mt-8">
        <Button
          className="w-full"
          onClick={onNext}
          disabled={!projectName || !route || routeStatus !== "available"}
        >
          Next
        </Button>
      </div>
    </>
  );
}