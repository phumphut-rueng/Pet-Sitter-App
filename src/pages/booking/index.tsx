import ProgressStep from "@/components/progress-step/ProgressStep"
import { useBookingForm } from "@/hooks/useBookingForm"
import BookingInformation from "@/components/booking/BookingSelectInformation"
import BookingSelectDetail from "@/components/booking/BookingSelectDetail"
import PrimaryButton from "@/components/buttons/PrimaryButton";
import BookingSelectYourPet from "@/components/booking/BookingSelectYourPet";
import { useState } from "react";
import BookingSelectPayment from "@/components/booking/BookingSelectPayment";
import { useRouter } from "next/router";
import { formatToThaiTimeAD } from "@/utils/date-utils";

export default function BookingPage() {
    const router = useRouter()
    const { date, startTime, endTime, sitterId } = router.query

    let [activeNumner, setActiveNumner] = useState<number>(1);

    const heandleBack = () => {
        if (activeNumner > 1) {
            setActiveNumner(prev => --prev);
            console.log("heandleBack", activeNumner);
        }
    }

    const heandleNext = () => {
        if (activeNumner < 3) {
            setActiveNumner(prev => ++prev);
            console.log("heandleNext", activeNumner);
        }
    }

    return (
        <main className="container-1200 flex flex-col min-h-[calc(100vh-80px)] mx-auto bg-gray-1 px-4 py-8">
            <div className="flex flex-1 flex-col lg:flex-row gap-8">
                <div className="w-full flex flex-1 flex-col gap-5" >
                    {/* Left Side - Form */}
                    <div className="flex justify-center items-center bg-white rounded-2xl shadow-sm">
                        <ProgressStep activeNumner={activeNumner} />
                    </div>

                    <div className="flex flex-col flex-1 bg-white rounded-2xl ">
                        <div className="p-5 flex-1 overflow-auto">
                            {
                                activeNumner === 1 &&
                                (
                                    <div>
                                        <div
                                            className="bg-white rounded-2xl font-[500] text-[16px] py-2">
                                            Choose your pet
                                        </div>
                                        <BookingSelectYourPet />
                                    </div>
                                )
                            }
                            {
                                activeNumner === 2 &&
                                (<BookingInformation />)

                            }
                            {
                                activeNumner === 3 &&
                                (<BookingSelectPayment />)

                            }
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-between p-5">
                            <PrimaryButton
                                type="button"
                                textColor="orange"
                                bgColor="secondary"
                                text="Back"
                                onClick={heandleBack}
                            >
                            </PrimaryButton>

                            <PrimaryButton
                                type="submit"
                                textColor="white"
                                bgColor="primary"
                                text={activeNumner === 3 ? "Confirm Booking" : "Next"}
                                onClick={heandleNext}
                            >
                            </PrimaryButton>
                        </div>
                    </div>
                </div>

                {/* Right Side - Booking Detail */}
                <div className="w-full lg:w-[350px]">
                    <BookingSelectDetail />
                </div>
            </div>
        </main >
    )
}
