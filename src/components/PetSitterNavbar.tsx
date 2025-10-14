import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils/utils";

type Props = {
  name: string;
  avatarUrl?: string;
  className?: string;
};

export default function PetSitterNavbar({
  name,
  avatarUrl = "/icons/avatar-placeholder.svg",
  className,
}: Props) {
  return (
    <header className={cn("w-full bg-white", className)}>
      <div className="mx-auto h-12 px-12 flex items-center justify-between">
        {/* Left: avatar + name */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-2">
          <Image
            src={avatarUrl}
            alt={name}
            width={30}
            height={30}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
            className="w-full h-full object-cover object-center rounded-full"
          />
          </div>
          <span className="font-medium text-gray-9">{name}</span>
        </div>

        {/* Right: messages button */}
        <Link
          href="/sitter/messages"
          aria-label="Messages"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-1
                     hover:bg-gray-2"
        >
          <Image
            src="/icons/Messages.svg"
            alt="Messages"
            width={10}
            height={10}
            className="h-4 w-4 media-fluid"
          />
        </Link>
      </div>
    </header>
  );
}
