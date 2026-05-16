import { Suspense } from "react";
import { MapApp } from "@/components/layout/MapApp";

export const dynamic = "force-static";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MapApp />
    </Suspense>
  );
}
