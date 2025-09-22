import Navbar from "@/components/Navbar";
import AccountSidebar from "@/components/layout/AccountSidebarMini";
import { useProfileForm } from "@/hooks/useProfileForm";
import ProfileForm from "@/components/features/account/ProfileForm";

export default function AccountProfilePage() {
  const { form, loading, saving, serverError, onSubmit } = useProfileForm();

  return (
    <>
      <Navbar />
      <main className="mx-auto px-4 text-gray-900 max-w-[1200px]">
        <section className="py-10">

          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
            {/* ซ้าย: 284px + sticky */}
            <AccountSidebar className="md:sticky md:top-6" />


            <section className="flex-1 min-w-0">
              <div className="w-full max-w-[956px]">
                <div className="rounded-2xl border border-gray-200 p-6 bg-white text-gray-900">
                  <h1 className="text-xl font-semibold mb-4">Profile</h1>

                  {loading ? (
                    <p>กำลังโหลดข้อมูล...</p>
                  ) : (
                    <ProfileForm
                      control={form.control}
                      onSubmit={onSubmit}
                      saving={saving}
                      serverError={serverError}
                    />
                  )}
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}