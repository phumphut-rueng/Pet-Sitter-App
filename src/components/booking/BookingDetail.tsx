import { formatToddMMyyyy } from "@/lib/utils/date"
import { formatTo12hTime } from "@/lib/utils/time"

export default function BookingSelectDetail(
    {
        sitterName,
        startTime,
        endTime,
        duration,
        petName,
        price
    }: {
        sitterName: string
        startTime: string | string[] | undefined
        endTime: string | string[] | undefined
        duration: string
        petName: string
        price: number
    }) {
    return (

        <div className="bg-white md:rounded-2xl md:shadow-md space-y-4">
            <h3
                className="font-[700] text-[24px] p-6 border-b border-gray-2">
                Booking Detail
            </h3>
            <div className="text-sm text-gray-6 space-y-6 p-6">
                <LabelText
                    textHeader="Pet Sitter"
                    textDetail={sitterName}
                />
                <LabelText
                    textHeader="Date & Time"
                    textDetail={`${formatToddMMyyyy(startTime)} | ${formatTo12hTime(startTime)} - ${formatTo12hTime(endTime)}`}
                />
                <LabelText
                    textHeader="Duration"
                    textDetail={duration}
                />
                <LabelText
                    textHeader="Pet"
                    textDetail={petName}
                />
            </div>
            <div
                className="flex justify-between items-center p-6 bg-black md:rounded-b-2xl text-[16px] text-white">
                <span>Total</span>
                <span>{price} THB</span>
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