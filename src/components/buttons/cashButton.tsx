import { useState } from "react"

type CashButtonProps = {
    onClick?: () => void
    type ?: "button" | "submit" 
}
export default function CashButton({onClick, type}: CashButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    return(
        <button className="h-20 px-18 rounded-full flex items-center text-base font-bold bg-white text-gray-6 border border-gray-2  
        hover:border-orange-5 hover:text-orange-5 hover:cursor-pointer active:scale-95 transition"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        type = {type}
        >
        <img
          src={isHovered ? "/icons/orangeCash.svg" : "/icons/cash.svg" }
          alt="icon"
          className="inline-block mr-2 w-6 h-6"
        />
            Cash
        </button>
    )
}
