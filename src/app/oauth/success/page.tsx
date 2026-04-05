"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OAuthSuccessContent() {
  const params = useSearchParams();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const connectorId = params.get("connector_id");
    const connectorType = params.get("type");

    if (window.opener) {
      window.opener.postMessage(
        { type: "oauth_success", connector_id: connectorId, connector_type: connectorType },
        window.location.origin
      );
      window.close();
    } else {
      // Fallback: not opened as popup — redirect to connectors page
      setDone(true);
      setTimeout(() => { window.location.href = "/connectors"; }, 1500);
    }
  }, [params]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-400/10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-green-400">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <p className="text-base font-semibold text-text-primary">Connected!</p>
      <p className="mt-1 text-sm text-text-muted">
        {done ? "Redirecting to connectors…" : "Closing this window…"}
      </p>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense>
      <OAuthSuccessContent />
    </Suspense>
  );
}
