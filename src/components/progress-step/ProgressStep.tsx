import ProgressBar from "./ProgressBar"

interface ProgressStepProps {
    activeStep?: number;
    size?: number;
}


export default function ProgressStep({
    activeStep = 1,
    size = 28
}: ProgressStepProps) {
    return (
        <div className="flex gap-6 p-6">
            <ProgressBar
                number={1}
                size={size}
                label="Your Pet"
                status={activeStep === 1 ? "active" : activeStep > 1 ? "done" : "inactive"} />
            <ProgressBar
                number={2}
                size={size}
                label="Information"
                status={activeStep === 2 ? "active" : activeStep > 2 ? "done" : "inactive"} />
            <ProgressBar
                number={3}
                size={size}
                label="Payment"
                status={activeStep === 3 ? "active" : "inactive"} />
        </div>
    )
}