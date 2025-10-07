import ProgressBar from "./ProgressBar"

interface ProgressStepProps {
    activeNumber?: number;
    size?: number;
}


export default function ProgressStep({
    activeNumber = 1,
    size = 28
}: ProgressStepProps) {
    return (
        <div className="flex gap-6 p-6">
            <ProgressBar
                number={1}
                size={size}
                label="Your Pet"
                status={activeNumber === 1 ? "active" : activeNumber > 1 ? "done" : "inactive"} />
            <ProgressBar
                number={2}
                size={size}
                label="Information"
                status={activeNumber === 2 ? "active" : activeNumber > 2 ? "done" : "inactive"} />
            <ProgressBar
                number={3}
                size={size}
                label="Payment"
                status={activeNumber === 3 ? "active" : "inactive"} />
        </div>
    )
}