import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo } from "react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    //ยังไม่แน่ใจว่าจะใช้ onClick ยังไง เอาหน้าตาไปก่อนแล้วกัน
    onClick?: (page: number) => void
    // onClick?: (page: React.MouseEvent<HTMLButtonElement>) => void
}

const navButtonClass = (disabled: boolean) => {
    return cn(
        "flex h-8 w-8 items-center justify-center rounded-full text-gray-4 hover:text-orange-5",
        disabled && "pointer-events-none opacity-40"
    )
}

export function Pagination({ currentPage, totalPages, onClick }: PaginationProps) {
    const pages = useMemo(() => {
        const pagesArray: (number | string)[] = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pagesArray.push(i)
            }
        } else {
            if (currentPage <= 3) {
                pagesArray.push(
                    1, 2, 3,
                    "...",
                    totalPages)
            } else if (currentPage >= totalPages - 2) {
                pagesArray.push(1,
                    "...",
                    totalPages - 2,
                    totalPages - 1,
                    totalPages)
            } else {
                pagesArray.push(1,
                    "...",
                    currentPage - 1,
                    currentPage,
                    currentPage + 1,
                    "...",
                    totalPages)
            }
        }

        return pagesArray;
    }, [currentPage, totalPages]);

    return (
        <div className="body-sm flex items-center justify-center gap-2">
            {/* Prev */}
            <button
                onClick={() => onClick?.(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={navButtonClass(currentPage === 1)}
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {/* numbers */}
            <div className="flex items-center gap-2">
                {pages.map((p, idx) =>
                    p === "..." ? (
                        <span key={idx} className="px-2 text-gray-4">
                            ...
                        </span>
                    ) : (
                        <button
                            key={idx}
                            onClick={() => onClick?.(p as number)}
                            className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full cursor-pointer",
                                currentPage === p
                                    ? "bg-orange-1 text-orange-5 pointer-events-none "
                                    : "text-gray-4 hover:text-orange-5 text"
                            )}
                        >
                            {p}
                        </button>
                    )
                )}
            </div>

            {/* Next */}
            <button
                onClick={() => onClick?.(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={navButtonClass(currentPage === totalPages)}
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    )
}


{/* 
    How to use
    currentPage = หน้าปัจจุบัน
    totalPages = หน้าทั้งหมด
    onClick = click แล้วให้ทำอะไร 
    <Pagination currentPage={45} totalPages={45} /> 
*/}