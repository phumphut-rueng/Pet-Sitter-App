import { cn } from "@/lib/utils/utils"

export function NavigationButton({
    onClick,
    disabled,
    icon,
}: {
    onClick: () => void
    disabled: boolean
    icon: React.ReactNode
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn("p-2 rounded-full",
                disabled
                    ? "text-gray-4 cursor-not-allowed"
                    : "hover:text-orange-5 cursor-pointer"
            )}
        >
            {icon}
        </button>
    )
}