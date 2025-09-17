import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface RejectConfirmationProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onReject: () => void
}

export default function RejectConfirmation(
    { open, onOpenChange, onReject }: RejectConfirmationProps
) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="p-0 rounded-xl w-[400px] border-transparent">
                {/* Header */}
                <div className="p-3 pl-5 flex justify-between items-center border-b border-gray-2">
                    <AlertDialogTitle className="h4">
                        Reject Confirmation
                    </AlertDialogTitle>
                    <AlertDialogCancel
                        className="body-sm border-transparent shadow-transparent
                        hover:text-gray-4"
                    >
                        ✕
                    </AlertDialogCancel>
                </div>

                <div className="pl-5 pr-4 pb-4">
                    {/* Description */}
                    <AlertDialogDescription className="pb-3 body-sm">
                        Are you sure to reject this pet sitter?
                    </AlertDialogDescription>

                    <AlertDialogDescription>
                        <span
                            className="caption text-black">
                            Reason and suggestion
                        </span>
                        <textarea className="w-full border border-gray-4"></textarea>
                    </AlertDialogDescription>

                    {/* Actions */}
                    <div className="flex justify-between gap-4 mt-4">
                        <AlertDialogCancel asChild>
                            <Button
                                variant="outline"
                                className="bg-orange-50 text-orange-500 hover:bg-orange-2 border-0"
                            >
                                Cancel
                            </Button>
                        </AlertDialogCancel>
                        <Button
                            className="bg-orange-5 hover:bg-orange-6 text-white"
                            onClick={onReject}
                        >
                            Reject
                        </Button>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}

{/* 
    const [isOpenAlert, setisOpenAlert] = useState(false);

    <RejectConfirmation
        open={isOpenAlert}
        onOpenChange={setisOpenAlert}
        onReject={() => { }}
    />
*/}