import ProgressBar from './ProgressBar'
import ProgressStep from './ProgressStep'

export default function HowToUse() {
    return (
        <>
            <div className='p-5'>
                ProgressBar
                <ProgressBar
                    label="Booking "
                    status="active" />
                <ProgressBar
                    number={2}
                    label="Booking "
                    status="inactive" />
                <ProgressBar
                    number={3}
                    label="Booking "
                    status="done" />
                <br />
            </div>

            <div className='p-5'>
                ProgressStep
                {/* activeNumner คือ เลขที่จะให้ active*/}
                <ProgressStep
                    activeNumner={2}
                />
            </div>
        </>
    );
}

