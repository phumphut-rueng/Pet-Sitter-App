import Image from "next/image"
type IconButtonProps = {
    icon: string
    type?: "button" | "submit" | "reset";
    onClick?: () => void;
}
export default function IconButton({ icon, type = "button", onClick }: IconButtonProps) {
  return <button className="h-15 w-15 bg-orange-1 rounded-full flex items-center  justify-center hover:cursor-pointer active:scale-95 transition "
            onClick={onClick}
            type={type}
            >
            <Image
              src={icon}
              alt="icon"
              width={24}
              height={24}
              className=" w-6 h-6"
            />
         </button>
}