import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AlertConfirmProps {
    title: string
    open: boolean
    width?: number
    onOpenChange: (open: boolean) => void
    description: React.ReactNode
}

export default function AlertConfirm(
    { title, open, width = 400, onOpenChange, description }: AlertConfirmProps
) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent
                style={{ width: `${width}px` }}
                className={"p-0 rounded-xl font-[700] border-transparent"}>
                {/* Header */}
                <div className="p-3 pl-5 flex justify-between items-center border-b border-gray-2">
                    <AlertDialogTitle className="text-black text-[20px]">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogCancel
                        className="text-gray-4 border-transparent shadow-transparent
                        hover:text-gray-9 text-[17px]"
                    >
                        ✕
                    </AlertDialogCancel>
                </div>

                {/* Description */}
                <div className="pl-5 pr-4 pb-4 text-[16px]">
                    {description}
                </div>
            </AlertDialogContent>
        </AlertDialog >
    );
}