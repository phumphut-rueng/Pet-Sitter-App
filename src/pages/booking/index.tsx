import ProgressStep from "@/components/progress-step/ProgressStep"
import BookingInformation from "@/components/booking/BookingInformation"
import BookingDetail from "@/components/booking/BookingDetail"
import PrimaryButton from "@/components/buttons/PrimaryButton";
import BookingYourPet from "@/components/booking/BookingYourPet";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import { useBookingHandler } from "@/hooks/booking/useBookingHandler";
import BookingConfirmation from "@/components/modal/BookingConfirmation";
import BookingPayment from "@/components/booking/BookingPayment";
import BookingSuccess from "@/components/booking/BookingSuccess";
import Image from "next/image";
import Script from "next/script";

export default function BookingHandler() {
    const {
        startTime,
        endTime,
        activeStep,
        pets,
        setPets,
        petType,
        sitter,
        loading,
        bookingData,
        isConfirmation,
        setIsConfirmation,
        isCreditCard,
        setIsCreditCard,
        isProcessingPayment,
        hasSelection,
        duration,
        petNames,
        totalPrice,
        handleBack,
        handleNext,
        handleRefreshPets,
        handleConfirmation,
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
        <main className="relative container-1200 flex flex-col min-h-[calc(100vh-80px)] mx-auto md:px-4 md:py-8">
            <Script
                src="https://cdn.omise.co/omise.js"
                strategy="lazyOnload"
                onLoad={() => {
                    console.log('Omise script loaded');
                }}
            />
            {activeStep !== 4
                ? <>
                    <Image
                        src="/images/booking/booking1.svg"
                        width={239}
                        height={350}
                        alt="booking"
                        className="absolute bottom-0 right-0"
                        priority
                        style={{ width: 'auto', height: 'auto' }}
                    />
                </>
                : <>
                    <Image
                        src="/images/booking/booking2.svg"
                        width={255}
                        height={371}
                        alt="booking"
                        className="absolute top-0 left-0"
                        loading="lazy"
                        style={{ width: 'auto', height: 'auto' }}
                    />
                    <Image
                        src="/images/booking/booking3.svg"
                        width={255}
                        height={371}
                        alt="booking"
                        className="absolute bottom-0 right-0"
                        priority
                        style={{ width: 'auto', height: 'auto' }}
                    />
                </>
            }
            {
                isProcessingPayment
                    ? <PetPawLoading
                        message="Processing Payment"
                        size="lg"
                    // baseStyleCustum="flex items-center justify-center w-full h-full"
                    />
                    :
                    activeStep !== 4 ?
                        <div className="relative flex flex-1 flex-col lg:flex-row gap-8">
                            {/* Left Side - Form */}
                            <div className="w-full flex flex-1 flex-col md:gap-5">
                                <div className="flex justify-center items-center bg-white rounded-2xl md:shadow-md ">
                                    <ProgressStep activeStep={activeStep} />
                                </div>

                                <div className="flex flex-col flex-1 bg-white md:rounded-2xl md:shadow-md ">

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
                                                        <BookingYourPet
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
                                                    <BookingPayment
                                                        form={form}
                                                        error={error}

                                                        isCreditCard={isCreditCard}
                                                        setIsCreditCard={setIsCreditCard}
                                                        handleSubmit={handleNext}
                                                        handleCardNumberChange={handleCardNumberChange}
                                                        handleCardNameChange={handleCardNameChange}
                                                        handleExpiryDateChange={handleExpiryDateChange}
                                                        handleCVCChange={handleCVCChange}
                                                    />
                                                )}</>)}
                                    </div>
                                    <div className="hidden md:block">
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

                            </div>

                            {/* Right Side - Booking Detail */}
                            <div className="w-full lg:w-[350px]">
                                <BookingDetail
                                    sitterName={sitter?.name ?? ""}
                                    startTime={startTime}
                                    endTime={endTime}
                                    duration={duration}
                                    petName={petNames}
                                    price={totalPrice}
                                    petType={petType}
                                />
                            </div>

                            <div className="md:hidden">
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
                        :
                        <div className=" ">
                            <BookingSuccess
                                bookingData={bookingData}
                                duration={duration}
                                petName={petNames}

                            /></div>

            }
            <BookingConfirmation
                open={isConfirmation}
                onOpenChange={setIsConfirmation}
                onConfirm={handleConfirmation}
            />
        </main>
    )
}