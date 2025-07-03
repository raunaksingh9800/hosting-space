"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Step2Props = {
  description: string;
  setDescription: (v: string) => void;
  onBack: () => void;
  onFinish: () => void;
};

export default function Step2({
  description,
  setDescription,
  onBack,
  onFinish,
}: Step2Props) {
  return (
    <>
      <h1 className="text-2xl md:text-3xl mt-2 md:mt-5 text-center">
        Let’s Build Something{" "}
        <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent font-semibold">
          Amazing.
        </span>
      </h1>

            <div className="mt-10 flex flex-col gap-3">
        <label className="text-sm">Project Title</label>
        <Input
          type="text"
          placeholder="Cooking app"
        />
      </div>


            <div className="mt-5 flex flex-col gap-3">
        <label className="text-sm">Whom does your site traget?</label>
        <Input
          type="text"
          placeholder="student"
        />
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <label className="text-sm">What is your project description</label>
        <Textarea           
   
          value={description}
          onChange={(e) => setDescription(e.target.value)} placeholder="Type your message here." />
      </div>




      

      <div className="w-full h-fit mt-8 flex flex-row gap-3">
        <Button className="w-1/5" variant={'outline'} onClick={onBack}>
          Back
        </Button>
        <Button className="w-[76%]" onClick={onFinish}>
          Next
        </Button>
      </div>
    </>
  );
}
