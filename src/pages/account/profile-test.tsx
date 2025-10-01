import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import { User } from "../../types/user.types";

// หน้าโปรไฟล์ผู้ใช้ - แสดงข้อมูลจาก session และ database
export default function UserProfile() {
  // NextAuth: useSession() จะ auto-fetch session จาก server และ cache ไว้
  // NextAuth: status จะเป็น "loading" | "authenticated" | "unauthenticated"
  // NextAuth: update() ใช้สำหรับ refresh session หลัง update ข้อมูล
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null); // ข้อมูลจากฐานข้อมูล
  const [name, setName] = useState(""); // สำหรับแก้ไขชื่อ
  const [loading, setLoading] = useState(false); // สำหรับแสดงสถานะการโหลด

  // NextAuth: ตรวจสอบ authentication status และ redirect ถ้าไม่ได้ล็อกอิน
  useEffect(() => {
    if (status === "loading") return; // NextAuth: รอให้ session load เสร็จก่อน
    if (!session?.user) router.push("/auth/login"); // NextAuth: redirect ไปหน้า login ถ้าไม่ได้ล็อกอิน
    fetchProfile();
  }, [session, status, router]);

  // NextAuth: axios จะส่ง cookies โดยอัตโนมัติ ไม่ต้องใส่ Authorization header
  // NextAuth: API จะใช้ getServerSession() ดึงข้อมูล user จาก cookies
  const fetchProfile = async () => {
    try {
      const response = await axios.get("/api/user/profile-test");
      setProfile(response.data);
      setName(response.data.name || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // อัพเดทข้อมูลโปรไฟล์
  const updateProfile = async () => {
    setLoading(true);
    try {
      await axios.put("/api/user/profile-test", { name });
      await update(); // NextAuth: trigger JWT refresh ใน callbacks.jwt() ด้วย trigger: 'update'
      await fetchProfile(); // ดึงข้อมูลใหม่จาก database
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div className="container-1200 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">User Profile</h1>
      {/* Session Data */}
      <div className="border-2 border-gray-300 rounded-md p-4">
        <h2 className="text-xl font-bold mb-2">NextAuth Session</h2>
        <p>ID: {session?.user?.id}</p>
        <p>Email: {session?.user?.email}</p>
        <p>Name: {session?.user?.name}</p>
        <p>Roles: {session?.user?.roles?.join(", ")}</p>
      </div>

      {/* Database Data */}
      <div className="border-2 border-gray-300 rounded-md p-4">
        <h2 className="text-xl font-bold mb-2">Database Profile</h2>
        <p>ID: {profile?.id}</p>
        <p>Email: {profile?.email}</p>
        <p>Name: {profile?.name}</p>
        <p>Phone: {profile?.phone}</p>
        <p>Roles: {profile?.roles?.join(", ")}</p>
      </div>

      {/* Update Form */}
      <div className="border-2 border-gray-300 rounded-md p-4">
        <h2 className="text-xl font-bold mb-2">Update Profile</h2>
        <input
          className="w-full p-2 border rounded mb-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={updateProfile}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </div>
    </div>
  );
}
