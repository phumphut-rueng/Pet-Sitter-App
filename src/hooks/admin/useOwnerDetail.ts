import * as React from "react";
import type { OwnerDetail } from "@/types/admin/owners";

export function useOwnerDetail(id?: string) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [owner, setOwner] = React.useState<OwnerDetail | null>(null);
  const [tab, setTab] = React.useState<"profile" | "pets" | "reviews">("profile");

  React.useEffect(() => {
    if (!id) return;

    let aborted = false;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/owners/get-owner-by-id?id=${id}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(await res.text());
        const json: OwnerDetail = await res.json();
        if (!aborted) setOwner(json);
      } catch (e: unknown) {
        if (aborted) return;
        const msg =
          e instanceof DOMException && e.name === "AbortError"
            ? null // ไม่ต้องตั้ง error เวลา unmount/เปลี่ยน id ระหว่างโหลด
            : e instanceof Error
            ? e.message
            : String(e ?? "Failed to load");
        if (msg) setError(msg);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => {
      aborted = true;
      controller.abort();
    };
  }, [id]);

  return { loading, error, owner, tab, setTab };
}