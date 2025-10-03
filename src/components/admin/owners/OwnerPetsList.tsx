// src/components/admin/owners/OwnerPetsList.tsx
type PetLite = {
  id: number;
  name: string | null;
  breed?: string | null;
  sex?: string | null;
  age_month?: number | null;

  // เผื่อฟิลด์ส่วนเกินจาก API (ไม่ใช้ก็ได้ แต่กัน compile error)
  color?: string | null;
  image_url?: string | null;
  created_at?: string;
};

export default function OwnerPetsList({ pets }: { pets: PetLite[] }) {
  if (!pets.length) {
    return <div className="px-10 pb-10 pt-6 text-gray-500">No pets.</div>;
  }

  return (
    <div className="px-10 pb-10 pt-6">
      <ul className="space-y-3">
        {pets.map((p) => (
          <li key={p.id} className="rounded-lg border p-3">
            <div className="font-medium">{p.name ?? "-"}</div>
            <div className="text-sm text-gray-600">
              {p.breed || "-"} • {p.sex || "-"} • {p.age_month ?? "-"} months
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}