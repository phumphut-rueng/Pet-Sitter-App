import Sidebar from "@/components/layout/SitterSidebar";

export default function SidebarDemo() {
  return (
    <div className="flex h-screen">
      <Sidebar
        logoSrc="/images/icon/sitter-logo.svg"
        onNavigate={(id) => console.log("goto:", id)}
      />
      <main className="flex-1 bg-white" />
    </div>
  );
}
