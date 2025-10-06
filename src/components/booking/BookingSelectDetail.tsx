import { useBookingForm } from "@/hooks/useBookingForm"

export default function BookingSelectDetail() {
    const {
        form,
        error,
        handleChange,
        handlePhoneChange,
    } = useBookingForm();

    return (

        <div className="bg-white rounded-2xl shadow-md space-y-4">
            <h3
                className="font-[700] text-[24px] border-b p-6 border-gray-2">
                Booking Detail
            </h3>
            <div className="text-sm text-gray-600 space-y-6 p-6">
                <LabelText
                    textHeader="Pet Sitter"
                    textDetail="Happy House! By Jane Maison"
                />
                <LabelText
                    textHeader="Date & Time:"
                    textDetail="25 Aug, 2023 | 7 AM - 10 AM"
                />
                <LabelText
                    textHeader="Duration:"
                    textDetail="3 hours"
                />
                <LabelText
                    textHeader="Pet:"
                    textDetail="Mr.Ham, Bingsu"
                />
            </div>
            <div
                className="flex justify-between items-center p-6 bg-black rounded-b-2xl text-[16px] text-white">
                <span>Total</span>
                <span>900.00 THB</span>
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
            <span className="text-gray-6 text-[14px]">{textHeader}:</span>
            <span className="text-gray-9">{textDetail}</span>
        </p>
    )
}