import * as React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRound } from "lucide-react";
import { User } from "@/types/user.types";
import { MenuItem } from "@/types/navigation.types";

interface AvatarDropdownProps {
  user: User | null;
  menuItems: MenuItem[];
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

// 👇 type ช่วยสำหรับ user ที่อาจมี image / profile_image (ไม่ใช้ any)
type WithOptionalImages = {
  image?: string | null | undefined;
  profile_image?: string | null | undefined;
};

const AvatarDropdown = ({ user, menuItems, onLogout, onNavigate }: AvatarDropdownProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  if (!user) return null;

  // ใช้ภาพจาก image ก่อน ถ้าไม่มีค่อย fallback เป็น profile_image
  const u = user as User & Partial<WithOptionalImages>;
  const src: string | undefined =
    (typeof u.image === "string" && u.image) ||
    (typeof u.profile_image === "string" && u.profile_image) ||
    undefined;

  const name = user.name || "Profile";

  const handleMenuItemClick = async (item: MenuItem) => {
    setIsOpen(false);
    if (item.isLogout) {
      await onLogout();
    } else {
      onNavigate(item.href);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger className="outline-hidden">
        {/* กรอบกลม + ไม่บีบรูป */}
        <Avatar className="w-12 h-12 rounded-full overflow-hidden aspect-square ring-0">
          {src ? (
            <AvatarImage src={src} alt={name} className="w-full h-full object-cover" />
          ) : null}
          <AvatarFallback className="bg-gray-2 text-gray-5">
            <UserRound className="size-6" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[186px] bg-white border-0 shadow-md pb-2 rounded-2xl ring-1 ring-transparent focus-visible:ring-2 focus-visible:ring-brand"
        align="end"
        sideOffset={8}
      >
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            {item.isLogout && <DropdownMenuSeparator className="my-3 bg-gray-2" />}

            <DropdownMenuItem
              onClick={() => handleMenuItemClick(item)}
              className="
                group flex items-center gap-3 px-6 py-3 cursor-pointer
                text-ink hover:text-orange-5 active:text-orange-5
                hover:bg-orange-1/40 active:bg-orange-1/40
                rounded-lg transition-colors
              "
            >
              {item.avatarIcon && (
                <item.avatarIcon className="size-5 text-ink group-hover:text-orange-5 group-active:text-orange-5 transition-colors" />
              )}
              <span className="text-[16px] font-medium">
                {item.avatarText || item.text}
              </span>
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AvatarDropdown;