"use client";
import dynamic from "next/dynamic";

// ssr: false prevents React from rendering this on the server. Without it,
// the SSR'd HTML gets activeDay=null (no search params at build time), React
// hydrates with that server state, and the day selector shows "All" even when
// the URL has ?day=X. With ssr: false MapApp mounts fresh on the client and
// reads window.location.search directly, so the correct day is shown on first
// paint with no hydration mismatch.
const MapApp = dynamic(() => import("@/components/layout/MapApp"), {
  ssr: false,
  loading: () => null,
});

export default function Page() {
  return <MapApp />;
}
