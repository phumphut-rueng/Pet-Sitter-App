import ProgressBar from "./ProgressBar"

interface ProgressStepProps {
    activeNumner?: number;
    size?: number;
}


export default function ProgressStep({
    activeNumner = 1,
    size = 28
}: ProgressStepProps) {
    return (
        <div className="flex gap-6 p-6">
            <ProgressBar
                number={1}
                size={size}
                label="Your Pet"
                status={activeNumner === 1 ? "active" : "inactive"} />
            <ProgressBar
                number={2}
                size={size}
                label="Information"
                status={activeNumner === 2 ? "active" : "inactive"} />
            <ProgressBar
                number={3}
                size={size}
                label="Payment"
                status={activeNumner === 3 ? "active" : "inactive"} />
        </div>
    )
}