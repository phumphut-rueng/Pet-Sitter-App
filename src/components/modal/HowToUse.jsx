import { useState } from 'react';
import BookingConfirmation from './BookingConfirmation'
import RejectConfirmation from './RejectConfirmation'

export default function HowToUse() {
    const [isOpenBooking, setisOpenBooking] = useState(false);
    const [isOpenReject, setisOpenReject] = useState(false);
    return (
        <div className='p-5'>
            <button className='bg-orange-1 text-orange-6' onClick={() => { setisOpenBooking(true) }}>Booking Confirmation</button>
            <br />
            <button className='bg-orange-1 text-orange-6' onClick={() => { setisOpenReject(true) }}>Reject Confirmation</button>

            <BookingConfirmation
                open={isOpenBooking}
                onOpenChange={setisOpenBooking}
                onConfirm={() => { }}
            />

            <RejectConfirmation
                open={isOpenReject}
                onOpenChange={setisOpenReject}
                onConfirm={() => { }}
            />
        </div>
    );
}

