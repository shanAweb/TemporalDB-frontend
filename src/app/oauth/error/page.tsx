"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OAuthErrorContent() {
  const params = useSearchParams();
  const message = params.get("message") || "Authorization failed.";

  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage(
        { type: "oauth_error", message },
        window.location.origin
      );
      setTimeout(() => window.close(), 2500);
    }
  }, [message]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-400/10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-red-400">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
      <p className="text-base font-semibold text-text-primary">Connection failed</p>
      <p className="mt-1 max-w-xs text-sm text-text-muted">{message}</p>
      <p className="mt-3 text-xs text-text-muted">Closing this window…</p>
    </div>
  );
}

export default function OAuthErrorPage() {
  return (
    <Suspense>
      <OAuthErrorContent />
    </Suspense>
  );
}
