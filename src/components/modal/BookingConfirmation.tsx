import {
    AlertDialogCancel,
    AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import AlertConfirm from "./AlertConfirm"

interface ConfirmationProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export default function BookingConfirmation({
    open,
    onOpenChange,
    onConfirm,
}: ConfirmationProps) {
    return (
        <AlertConfirm
            open={open}
            onOpenChange={onOpenChange}
            title="Booking Confirmation"
            description={
                <>
                    {/* Description */}
                    <AlertDialogDescription className="pb-3 text-gray-6">
                        Are you sure to booking this pet sitter?
                    </AlertDialogDescription>

                    {/* Actions */}
                    <div className="flex justify-between gap-4 mt-4">
                        <AlertDialogCancel asChild>
                            <Button
                                variant="outline"
                                className="bg-orange-1 text-orange-5 hover:bg-orange-2 border-0"
                            >
                                Cancel
                            </Button>
                        </AlertDialogCancel>
                        <Button
                            className="bg-orange-5 hover:bg-orange-6 text-white"
                            onClick={onConfirm}
                        >
                            Yes, I’m sure
                        </Button>
                    </div>
                </>
            }
        />
    )
}
