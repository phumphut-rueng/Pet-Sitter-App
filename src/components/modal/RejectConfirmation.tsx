import {
    AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import AlertConfirm from "./AlertConfirm"
import PrimaryButton from "../buttons/PrimaryButton"

interface ConfirmationProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export default function RejectConfirmation({
    open,
    onOpenChange,
    onConfirm,
}: ConfirmationProps) {
    return (
        <AlertConfirm
            open={open}
            onOpenChange={onOpenChange}
            width={600}
            title="Reject Confirmation"
            description={
                <>
                    {/* Description */}
                    <AlertDialogDescription
                        className="pb-3 text-gray-6 font-[500]"
                    >
                        Are you sure to reject this pet sitter?
                    </AlertDialogDescription>
                    <AlertDialogDescription>
                        <span
                            className="caption text-black">
                            Reason and suggestion
                        </span>
                        <textarea
                            rows={5}
                            className="w-full rounded-md border border-gray-2 p-3 text-[16px] font-[100] 
                            placeholder:text-gray-6 
                            focus:outline-none focus:ring-0"
                            placeholder="Admin’s suggestion here"
                        ></textarea>
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
                            text="Reject"
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

{/* 
    const [isOpenAlert, setisOpenAlert] = useState(false);

    <RejectConfirmation
        open={isOpenAlert}
        onOpenChange={setisOpenAlert}
        onReject={() => { }}
    />
*/}