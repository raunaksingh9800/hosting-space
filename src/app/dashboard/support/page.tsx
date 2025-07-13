"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";

export default function AiPage() {
  const { user } = useUser();

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className=" text-center mb-6 mt-1">
        <h1 className=" text-2xl font-semibold">Get in Touch</h1>
        <p className=" text-sm  opacity-30 mt-1">Feel free to reach out with any inquiries.</p>
      </div>
      <div className=" flex flex-col">
        <div className="flex flex-row w-full gap-6">
          {/* First Name */}
          <div className="flex flex-col flex-1">
            <div className="text-sm mb-3">First Name</div>
            <Input 
              className="" 
              placeholder="Alice" 
              defaultValue={user?.firstName || ""}
            />
          </div>
          
          {/* Last Name */}
          <div className="flex flex-col flex-1">
            <div className="text-sm mb-3">Last Name</div>
            <div className="relative">
              <Input 
                className="" 
                placeholder="Bob" 
                defaultValue={user?.lastName || ""}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-col flex-1 mt-3">
            <div className="text-sm mb-3">Email Address</div>
            <Input 
              className="" 
              type="email" 
              placeholder="bob@exa.com" 
              defaultValue={user?.emailAddresses?.[0]?.emailAddress || ""}
            />
          </div>
        </div>

        <div>
          <div className="flex flex-col flex-1 mt-3">
            <div className="text-sm mb-3">Your query</div>
            <Textarea
              className="h-[30vh] md:min-h-[15vh]"
              placeholder="Anything you feel like"
            />
          </div>
        </div>

        <div>
          <Button className="w-full mt-6">Submit</Button>
        </div>
      </div>
    </div>
  );
}