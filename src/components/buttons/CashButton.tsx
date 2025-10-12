import { ReactElement } from "react"

type CashButtonProps = {
    text?: string
    icon?: ReactElement
    onClick?: () => void
    type?: "button" | "submit"
    selected?: boolean
}
export default function CashButton({
    text = "Credit Card",
    icon,
    onClick,
    type,
    selected = false
}: CashButtonProps) {

    return (
        <button
            className={`h-20 w-full md:px-18 rounded-full 
            flex items-center justify-center gap-2
            text-base font-bold transition
            active:scale-95
            ${selected
                    ? 'bg-white text-orange-5 border-2 border-orange-5' // เมื่อ selected
                    : 'bg-white text-gray-6 border border-gray-2 hover:border-orange-5 hover:text-orange-5' // ปกติ
                }
            hover:cursor-pointer`}
            onClick={onClick}
            type={type}
        >
            {icon}
            {text}
        </button>
    )
}
