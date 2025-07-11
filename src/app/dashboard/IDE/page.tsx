import IDE from "./IDE";
import { Suspense } from "react";

export default function IDEPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IDE />
    </Suspense>
  );
}
