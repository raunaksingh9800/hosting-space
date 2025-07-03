// app/not-found.tsx
"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <nav className="w-screen h-10 flex flex-row justify-between items-center px-5 md:px-10 mt-5 ">
        <div className="text-lg">
          Hosting <strong>Space</strong>
        </div>{" "}
      </nav>
      <div className="mt-42 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-8xl">😢</h1>
        <h2 className=" text-3xl font-semibold">Oops </h2>
        <h2 className=" mt-1  opacity-40 text-xl">404 | Page not found</h2>
        <Link
          href="/dashboard"
          className="px-6 py-2  mt-7  dark:text-white rounded-lg underline  transition"
        >
          Go back home
        </Link>
      </div>
    </>
  );
}
