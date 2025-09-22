import {
    AlertDialogCancel,
    AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import AlertConfirm from "./AlertConfirm"
import PrimaryButton from "../buttons/primaryButton"

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
                        {/* <AlertDialogCancel asChild>
                            <PrimaryButton
                                text="Cancel"
                                bgColor="secondary"
                                textColor="orange"
                                type="submit"
                            />
                        </AlertDialogCancel> */}
                        <PrimaryButton
                            text="Cancel"
                            bgColor="secondary"
                            textColor="orange"
                            type="submit"
                            onClick={() => onOpenChange(false)}
                        />
                        <PrimaryButton
                            text="Yes, I’m sure"
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
