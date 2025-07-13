"use client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, User, Settings, Menu } from "lucide-react";
import Link from "next/link";




export default function Sidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
                <nav className="flex flex-col h-full bg-background border-r">
                    <div className="flex items-center h-16 px-6 border-b">
                        <span className="font-bold text-lg">Hosting Space</span>
                    </div>
                    <ul className="flex-1 px-4 py-6 space-y-2">
                        <li>
                            <Link href="/" passHref>
                                <Button variant="ghost" className="w-full justify-start">
                                    <Home className="mr-2 h-5 w-5" /> Home
                                </Button>
                            </Link>
                        </li>
                        <li>
                            <Link href="/profile" passHref>
                                <Button variant="ghost" className="w-full justify-start">
                                    <User className="mr-2 h-5 w-5" /> Profile
                                </Button>
                            </Link>
                        </li>
                        <li>
                            <Link href="/settings" passHref>
                                <Button variant="ghost" className="w-full justify-start">
                                    <Settings className="mr-2 h-5 w-5" /> Settings
                                </Button>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </SheetContent>
        </Sheet>
    );
}