import ProgressBar from "./ProgressBar"

export default function ProgressStep({ activeNumner = 1 }) {
    return (
        <div className="flex gap-6 p-6">
            <ProgressBar
                number={1}
                label="Your Pet"
                status={activeNumner === 1 ? "active" : "inactive"} />
            <ProgressBar
                number={2}
                label="Information"
                status={activeNumner === 2 ? "active" : "inactive"} />
            <ProgressBar
                number={3}
                label="Payment"
                status={activeNumner === 3 ? "active" : "inactive"} />
        </div>
    )
}