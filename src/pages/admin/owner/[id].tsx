import * as React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import AdminSidebar from "@/components/layout/AdminSidebar";
import OwnerHeader from "@/components/admin/owners/OwnerHeader";
import OwnerProfileCard from "@/components/admin/owners/OwnerProfileCard";
import OwnerPetsList from "@/components/admin/owners/OwnerPetsList";
import BanConfirm from "@/components/admin/owners/BanConfirm";
import { useOwnerDetail } from "@/hooks/admin/useOwnerDetail";
import toast from "react-hot-toast";

export default function OwnerDetailPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const { loading, error, owner, tab, setTab } = useOwnerDetail(id);

  const [banOpen, setBanOpen] = React.useState(false);
  const [banLoading, setBanLoading] = React.useState(false);

  const handleBan = async () => {
    if (!owner) return;
    setBanLoading(true);
    try {
      const res = await fetch("/api/admin/owners/ban-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: owner.id }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("User banned");
      setBanOpen(false);
      // router.push("/admin/owner");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Ban failed";
      toast.error(message);
    } finally {
      setBanLoading(false);
    }
  };

  return (
    <>
      <Head><title>Admin • Owner Detail</title></Head>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="flex gap-6">
          <aside className="hidden md:block md:w-[240px] shrink-0">
            <AdminSidebar sticky />
          </aside>

          <main className="flex-1 min-w-0 px-4 py-6 lg:px-6">
            <button onClick={() => router.back()} className="mb-4 text-gray-600 hover:underline">
              ← Back
            </button>

            {loading && <div className="py-16 text-center text-gray-500">Loading…</div>}
            {!loading && error && <div className="py-16 text-center text-red-600">{error}</div>}
            {!loading && !error && !owner && <div className="py-16 text-center text-gray-500">Not found</div>}

            {!loading && owner && (
              <section className="rounded-tr-2xl rounded-br-2xl rounded-bl-2xl bg-white overflow-hidden">
                <OwnerHeader
                  title={owner.name || owner.email}
                  tab={tab}
                  onTabChange={setTab}
                />

                {tab === "profile" && (
                  <OwnerProfileCard owner={owner} onClickBan={() => setBanOpen(true)} />
                )}

                {tab === "pets" && <OwnerPetsList pets={owner.pets} />}

                {tab === "reviews" && (
                  <div className="px-10 pb-10 pt-6 text-gray-500">No reviews.</div>
                )}
              </section>
            )}
          </main>
        </div>
      </div>

      <BanConfirm
        open={banOpen}
        loading={banLoading}
        onOpenChange={setBanOpen}
        onConfirm={handleBan}
      />
    </>
  );
}