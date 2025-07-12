import AiPage from "./Ai";
import { Suspense } from "react";

export default function IDEPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AiPage />
    </Suspense>
  );
}
