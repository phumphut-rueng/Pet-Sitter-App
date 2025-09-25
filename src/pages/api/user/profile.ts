import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
// แปลงจาก custom middleware เป็น NextAuth - Convert from custom middleware to NextAuth
// import { requireAuth, type AuthenticatedRequest } from "@/middlewares/auth"; // ลบออกเพราะไม่มีไฟล์นี้ - Remove because file doesn't exist
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

/*
วิธีใช้ endpoint นี้ใน client page - How to use this endpoint in client page:

1. ในหน้า page ต้อง import useSession - In page component, import useSession:
   import { useSession } from "next-auth/react";

2. เช็ค authentication status:
   const { data: session, status } = useSession();
   if (status === 'loading') return <div>Loading...</div>;
   if (!session) return <div>Please login</div>;

3. เรียก API ได้เลย ไม่ต้องส่ง token เพราะ NextAuth จัดการให้:
   const response = await fetch('/api/user/profile');
   // หรือใช้ axios: await axios.get('/api/user/profile');

4. NextAuth จะส่ง HttpOnly cookies ไปกับทุก request อัตโนมัติ
   ไม่ต้องจัดการ Authorization header เอง

ตัวอย่างการใช้ใน page component:
const Profile = () => {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (session) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => setProfile(data));
    }
  }, [session]);

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return <div>Please login</div>;

  return <div>{profile?.name}</div>;
};
*/

// แปลงจาก requireAuth wrapper เป็น standard async function - Convert from requireAuth wrapper to standard async function
// export default requireAuth(async function handler(
//   req: AuthenticatedRequest,
//   res: NextApiResponse
// ) {
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // NextAuth: ดึง session จาก cookies โดยอัตโนมัติ - ไม่ต้องส่ง token มาเอง
  // NextAuth: getServerSession จะอ่าน HttpOnly cookies และ decode JWT ให้เราเลย
  const session = await getServerSession(req, res, authOptions);

  // เช็คว่ามี session และ user id หรือไม่ - Check if session and user id exist
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // NextAuth: session.user.id มาจาก JWT token ที่ถูก decode แล้ว
  // NextAuth: ข้อมูลนี้มาจาก callbacks.session ใน [...nextauth].ts
  // const userId = req.user!.id; // เก่า - old way with custom middleware
  const userId = session.user.id; // NextAuth way

  if (req.method === "GET") {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dob: true,
        profile_image: true,
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(200).json({
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      dob: user.dob ? user.dob.toISOString().slice(0, 10) : "",
      profileImage: user.profile_image ?? "",
    });
  }

  if (req.method === "PUT") {
    const { name, email, phone, dob, profileImage } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      dob?: string; // "YYYY-MM-DD"
      profileImage?: string;
    };

    await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        name: name ?? undefined,
        email: email ?? undefined,
        phone: phone ?? undefined,
        dob: dob ? new Date(dob) : undefined,
        profile_image: profileImage ?? undefined,
        updated_at: new Date(),
      },
    });

    return res.status(200).json({ message: "OK" });
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ error: "Method not allowed" });
}