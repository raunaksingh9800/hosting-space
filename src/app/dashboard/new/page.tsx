"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";

export default function AiPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [buildTypeIndex, setBuildTypeIndex] = useState(1); // default: Create with AI
  const [projectName, setProjectName] = useState("");
  const [route, setRoute] = useState("");
  const [title, settitle] = useState("");
  const [target, settarget] = useState("");
  const [description, setDescription] = useState("");

  const [routeStatus, setRouteStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  const handleNext = async () => {
    if (step === 1) {
      if (buildTypeIndex === 0) {
        // Static Site: Create immediately
        try {
          setLoading(true);

          const res = await fetch("/api/newsite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: projectName,
              routeName: route,
              buildType: "static",
            }),
          });

          setLoading(false);

          if (!res.ok) {
            let errMsg = "Something went wrong";
            try {
              const err = await res.json();
              errMsg = err?.error || errMsg;
            } catch {
              const text = await res.text();
              errMsg = text || errMsg;
            }
            alert("Failed to create site: " + errMsg);
            return;
          }

          // Redirect after short delay
          setTimeout(() => {
          window.location.href = `/dashboard?open_site=${encodeURIComponent(projectName)}&open_site_mode=IDE`;
          }, 800);
        } catch (e) {
          alert("Unexpected error: " + (e as Error).message);
          setLoading(false);
        }
      } else if (buildTypeIndex === 1) {
        // AI Site: Go to Step 2 for additional info
        setStep(2);
      }

      return;
    }

    if (step === 2 && buildTypeIndex === 1) {
      // Finish AI site creation
      try {
        setLoading(true);

        const prompt = `Title: ${title}\nTarget Audience: ${target}\nDescription: ${description}`;

        const res = await fetch("/api/createwithai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: projectName,
            routeName: route,
            buildType: "ai",
            prompt,
          }),
        });

        setLoading(false);

        if (!res.ok) {
          let errMsg = "Something went wrong";
          try {
            const err = await res.json();
            errMsg = err?.error || errMsg;
          } catch {
            const text = await res.text();
            errMsg = text || errMsg;
          }
          alert("Failed to create AI site: " + errMsg);
          return;
        }

        setTimeout(() => {
          window.location.href = `/dashboard?open_site=${encodeURIComponent(projectName)}&open_site_mode=ai`;
        }, 800);
      } catch (e) {
        alert("Unexpected error: " + (e as Error).message);
        setLoading(false);
      }

      return;
    }
  };

  const handleBack = () => setStep((prev) => prev - 1);

  // Debounce route check
  useEffect(() => {
    if (!route) {
      setRouteStatus("idle");
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setRouteStatus("checking");

      fetch(`/${route}`, {
        method: "GET",
        signal: controller.signal,
      })
        .then((res) => {
          if (res.status === 200) {
            setRouteStatus("taken");
          } else if (res.status === 404) {
            setRouteStatus("available");
          } else {
            setRouteStatus("idle");
          }
        })
        .catch((err) => {
          if (err.name !== "AbortError") setRouteStatus("idle");
        });
    }, 600); // debounce delay

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [route]);

  const fadeVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.3, ease: easeInOut },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2, ease: easeInOut },
    },
  };

  return (
    <div className="relative overflow-hidden w-full h-full flex flex-col md:flex-row md:items-center md:justify-center">
      {loading && (
        <div className="fixed inset-0 z-50 backdrop-blur bg-black/30 flex flex-col items-center justify-center">
          <span className="loader"></span>
          <h1 className="text-2xl md:text-3xl mt-2 md:mt-5 text-center">
            Building Something{" "}
            <span className="  bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent font-semibold">
              Amazing.
            </span>
          </h1>
          
          <p className="mt-3 opacity-70">Can take up to a Minute</p>
        </div>
      )}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Step1
              projectName={projectName}
              setProjectName={setProjectName}
              route={route}
              setRoute={setRoute}
              buildTypeIndex={buildTypeIndex}
              setBuildTypeIndex={setBuildTypeIndex}
              onNext={handleNext}
              routeStatus={routeStatus}
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Step2
              description={description}
              setDescription={setDescription}
              title={title}
              settitle={settitle}
              targetUser={target}
              settargetUser={settarget}
              onBack={handleBack}
              onFinish={handleNext} // instead of inline alert
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
