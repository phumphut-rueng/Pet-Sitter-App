import ProgressStep from "@/components/progress-step/ProgressStep"
import BookingInformation from "@/components/booking/BookingInformation"
import BookingSelectDetail from "@/components/booking/BookingDetail"
import PrimaryButton from "@/components/buttons/PrimaryButton";
import BookingSelectYourPet from "@/components/booking/BookingYourPet";
import BookingSelectPayment from "@/components/booking/BookingPayment";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import { useBookingHandler } from "@/hooks/booking/useBookingHandler";

export default function BookingHandler() {
    const {
        startTime,
        endTime,
        activeStep,
        pets,
        setPets,
        sitter,
        loading,
        hasSelection,
        duration,
        petNames,
        totalPrice,
        handleBack,
        handleNext,
        handleRefreshPets,
        form,
        error,
        handleChange,
        handlePhoneChange,
        handleTextAreaChange,
        handleCardNumberChange,
        handleCardNameChange,
        handleExpiryDateChange,
        handleCVCChange
    } = useBookingHandler()

    return (
        <main className="container-1200 flex flex-col min-h-[calc(100vh-80px)] mx-auto bg-gray-1 px-4 py-8">
            <div className="flex flex-1 flex-col lg:flex-row gap-8">
                {/* Left Side - Form */}
                <div className="w-full flex flex-1 flex-col gap-5">
                    <div className="flex justify-center items-center bg-white rounded-2xl shadow-sm">
                        <ProgressStep activeStep={activeStep} />
                    </div>

                    <div className="flex flex-col flex-1 bg-white rounded-2xl">

                        <div className="p-5 flex-1 overflow-auto">
                            {loading ? (
                                <>
                                    <PetPawLoading
                                        message="Loading Pet"
                                        size="lg"
                                        baseStyleCustum="flex items-center justify-center w-full h-full"
                                    />
                                </>
                            ) : (
                                <>
                                    {activeStep === 1 && (
                                        <div>
                                            <div className="bg-white rounded-2xl font-[500] text-[16px] py-2">
                                                Choose your pet
                                            </div>
                                            <BookingSelectYourPet
                                                pets={pets}
                                                setPets={setPets}
                                                onRefresh={handleRefreshPets}
                                            />
                                        </div>
                                    )}

                                    {activeStep === 2 && (
                                        <BookingInformation
                                            form={form}
                                            error={error}
                                            handleSubmit={handleNext}
                                            handleChange={handleChange}
                                            handlePhoneChange={handlePhoneChange}
                                            handleTextAreaChange={handleTextAreaChange}
                                        />
                                    )}

                                    {activeStep === 3 && (
                                        <BookingSelectPayment
                                            form={form}
                                            error={error}
                                            handleSubmit={handleNext}
                                            handleCardNumberChange={handleCardNumberChange}
                                            handleCardNameChange={handleCardNameChange}
                                            handleExpiryDateChange={handleExpiryDateChange}
                                            handleCVCChange={handleCVCChange}
                                        />
                                    )}</>)}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-between p-5">
                            <PrimaryButton
                                type="button"
                                textColor="orange"
                                bgColor="secondary"
                                text="Back"
                                onClick={handleBack}
                            />

                            <PrimaryButton
                                type="submit"
                                textColor="white"
                                bgColor="primary"
                                text={activeStep === 3 ? "Confirm Booking" : "Next"}
                                onClick={handleNext}
                                disabled={!hasSelection}
                            />
                        </div>
                    </div>

                </div>

                {/* Right Side - Booking Detail */}
                <div className="w-full lg:w-[350px]">
                    <BookingSelectDetail
                        sitterName={sitter?.name ?? ""}
                        startTime={startTime}
                        endTime={endTime}
                        duration={duration}
                        petName={petNames}
                        price={totalPrice}
                    />
                </div>
            </div>
        </main>
    )
}