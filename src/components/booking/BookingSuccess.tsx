import { MapPin } from 'lucide-react';
import PrimaryButton from "../buttons/PrimaryButton";
import { OmiseTokenResponse } from '@/types/omise.types';
import { formatTodddMMyyyy, formatToddMMyyyy } from '@/lib/utils/date';
import { formatTo12hTime } from '@/lib/utils/time';
import { useBookingHandler } from '@/hooks/booking/useBookingHandler';

export default function BookingSuccess(
    {
        duration,
        bookingData,
        petName
    }: {
        duration: string,
        petName: string,
        bookingData: OmiseTokenResponse | undefined
    }) {
    const data = bookingData?.booking;

    const {
        handleBackToHome,
        handleBookingDetail,
        handleViewMap,
    } = useBookingHandler()

    return (
        <div className="md:w-[640px] mx-auto overflow-hidden relative pt-5">
            {/* Middle Section */}
            <div className="flex flex-col flex-1">
                <div className="rounded-3xl shadow-md md:border md:border-gray-1">
                    {/* Thank You Box */}
                    <div className="bg-black text-white p-8 md:rounded-t-3xl text-center md:shadow-2xl ">
                        <h1 className="text-[36px] font-bold mb-3">
                            Thank You For Booking
                        </h1>
                        <p className="text-[16px] text-gray-4">
                            We will send your booking information to Pet Sitter.
                        </p>
                    </div>

                    {/* Booking Info */}
                    <div className="bg-white p-6 md:rounded-xl">
                        {/* Transaction Info */}
                        <div className="mb-5">
                            <div className="text-gray-4 text-[16px] mb-1">
                                Transaction Date : {`${formatTodddMMyyyy(data?.payment_date || new Date().toISOString())}`}
                            </div>
                            <div className="text-gray-4 text-[16px]">
                                Transaction No. : {data?.id}
                            </div>
                        </div>

                        {/* Pet Sitter */}
                        <div className="mb-5">
                            <div className="text-gray-6 text-[14px] mb-1">
                                Pet Sitter:
                            </div>
                            <div className="flex justify-between text-gray-9">
                                {data?.sitter.name}
                                <div className="w-[200px]">
                                    <button
                                        onClick={handleViewMap}
                                        className="flex justify-between items-start text-orange-5 text-sm md:ml-2 hover:text-orange-6"
                                    >
                                        <MapPin />
                                        View Map
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Date Time and Duration */}
                        <div className="flex gap-10 mb-5 flex-wrap  text-[16px]">
                            <LabelText
                                textHeader="Date & Time"
                                textDetail={`${formatToddMMyyyy(data?.date_start)} | ${formatTo12hTime(data?.date_start)} - ${formatTo12hTime(data?.date_end)}`}
                            />
                            <LabelText
                                textHeader="Duration"
                                textDetail={duration}
                            />
                        </div>

                        <div className="mb-5">
                            <LabelText
                                textHeader="Pet"
                                textDetail={petName}
                            />
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center pt-5 border-t-2 border-gray-2 mt-5 text-black">
                            <div className="text-[16px]">
                                Total
                            </div>
                            <div
                                className="text-[18px]">
                                {Number((bookingData?.amount || 0) / 100).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-center p-5 gap-3 mt-auto">
                    <PrimaryButton
                        type="button"
                        textColor="orange"
                        bgColor="secondary"
                        text="Booking Detail"
                        onClick={handleBookingDetail}
                    />

                    <PrimaryButton
                        type="submit"
                        textColor="white"
                        bgColor="primary"
                        text="Back To Home"
                        onClick={handleBackToHome}
                    />
                </div>
            </div>
        </div>
    )
}

function LabelText(
    {
        textHeader,
        textDetail
    }: {
        textHeader: string;
        textDetail: string;
    }) {
    return (
        <p className="flex flex-col font-[500]">
            <span className="text-gray-6 text-[14px]">{textHeader} :</span>
            <span className="text-gray-9">{textDetail}</span>
        </p>
    )
}