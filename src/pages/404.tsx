import Navbar from "@/components/navbar/Navbar";

export default function NotFound() {
  return (
    <>
    <Navbar />
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
    </div>
    </>
  );
}