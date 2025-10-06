import * as React from "react";
import PetCard from "./PetCard";
import PetDetailModal from "./PetDetailModal";
import toast from "react-hot-toast";

type PetItem = {
  id: number;
  name: string | null;
  image_url: string | null;
  pet_type_name?: string;
  breed: string | null;
  sex: string | null;
  age_month: number | null;
  color: string | null;
  is_banned?: boolean | null;
};

export default function OwnerPetsList({ pets }: { pets: PetItem[] }) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<PetItem | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleOpen = (p: PetItem) => {
    setActive(p);
    setOpen(true);
  };

  async function toggleSuspend(petId: number, nextSuspend: boolean) {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/pets/${petId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextSuspend ? "ban" : "unban" }),
      });
      if (!res.ok) throw new Error(await res.text());

      // อัปเดตในลิสต์ทันที
      setActive((prev) => (prev ? { ...prev, is_banned: nextSuspend } : prev));
      // (อัปเดต array)
      // @ts-ignore
      pets = pets.map((p) => (p.id === petId ? { ...p, is_banned: nextSuspend } : p));

      toast.success(nextSuspend ? "Pet suspended" : "Pet unsuspended");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="px-10 pb-10 pt-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pets.length === 0 ? (
            <div className="text-gray-500">No pets.</div>
          ) : (
            pets.map((p) => (
              <PetCard
                key={p.id}
                name={p.name ?? "(no name)"}
                typeLabel={p.pet_type_name}
                imageUrl={p.image_url || undefined}
                onClick={() => handleOpen(p)}
              />
            ))
          )}
        </div>
      </div>

      <PetDetailModal
        open={open}
        onOpenChange={setOpen}
        pet={active}
        onToggleSuspend={toggleSuspend}
        loading={loading}
      />
    </>
  );
}