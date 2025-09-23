import {
    AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import AlertConfirm from "./AlertConfirm"
import PrimaryButton from "../buttons/primaryButton"

interface ConfirmationProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export default function RegisterConfirmation({
    open,
    onOpenChange,
    onConfirm,
}: ConfirmationProps) {
    return (
        <AlertConfirm
            open={open}
            onOpenChange={onOpenChange}
            title="Register as a Sitter"
            description={
                <>
                    {/* Description */}
                    <AlertDialogDescription className="pb-3 text-gray-6">
                        This email is already registered.<br />
                        Do you want to sign up as a sitter too?
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
