import AdminLayout from "@/components/layout/AdminLayout";

export default function AdminOwnerListPage() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold mb-6">Pet Owner</h1>
      {/* TODO: ตาราง/ค้นหาใน Ticket #23 */}
      <div className="rounded-xl border bg-white p-6 text-gray-500">
        Owner list placeholder (Ticket #23)
      </div>
    </AdminLayout>
  );
}