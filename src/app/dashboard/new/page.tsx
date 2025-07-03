"use client";

import { useState } from "react";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";

export default function AiPage() {
  const [step, setStep] = useState(1);

  // Form state
  const [projectName, setProjectName] = useState("");
  const [route, setRoute] = useState("");
  const [description, setDescription] = useState("");

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  // 👇 Only fade transitions now
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
    <div className="relative overflow-hidden w-full h-full flex flex-col md:flex-row md:items-center md:justify-center ">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className=""
          >
            <Step1
              projectName={projectName}
              setProjectName={setProjectName}
              route={route}
              setRoute={setRoute}
              onNext={handleNext}
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
            className=""
          >
            <Step2
              description={description}
              setDescription={setDescription}
              onBack={handleBack}
              onFinish={() => alert("Project Submitted!")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
