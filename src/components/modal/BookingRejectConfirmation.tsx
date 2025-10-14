import {
    AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import AlertConfirm from "./AlertConfirm"
import PrimaryButton from "../buttons/PrimaryButton"

interface ConfirmationProps {
    title?: string
    description?: string
    textButton?: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export default function BookingRejectConfirmation({
    title = "Reject Confirmation",
    description = "Are you sure to reject this booking?",
    textButton = "Reject Booking",
    open,
    onOpenChange,
    onConfirm,
}: ConfirmationProps) {
    return (
        <AlertConfirm
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={
                <>
                    {/* Description */}
                    <AlertDialogDescription className="pb-3 text-gray-6 whitespace-pre-line">
                        {description}
                    </AlertDialogDescription>

                    {/* Actions */}
                    <div className="flex justify-between gap-4 mt-4">
                        <PrimaryButton
                            text="Cancel"
                            bgColor="secondary"
                            textColor="orange"
                            type="submit"
                            onClick={() => onOpenChange(false)}
                        />
                        <PrimaryButton
                            text={textButton}
                            bgColor="primary"
                            textColor="white"
                            type="submit"
                            onClick={onConfirm}
                        />
                    </div>
                </>
            }
        />
    )
}
