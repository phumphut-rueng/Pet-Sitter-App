import ProgressStep from "@/components/progress-step/ProgressStep"
import { useBookingForm } from "@/hooks/useBookingForm"
import BookingInformation from "@/components/booking/BookingSelectInformation"
import BookingSelectDetail from "@/components/booking/BookingSelectDetail"
import PrimaryButton from "@/components/buttons/PrimaryButton";
import BookingSelectYourPet from "@/components/booking/BookingSelectYourPet";
import { useEffect, useState } from "react";
import BookingSelectPayment from "@/components/booking/BookingSelectPayment";
import { useRouter } from "next/router";
import { formatToThaiTimeAD } from "@/utils/date-utils";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";
import { Pet, PetStatus } from "@/types/pet.types";
import { getPetById, getSitterById } from "@/lib/booking/booking-api";
import { PetType, Sitter } from "@/types/sitter.types";

export default function handler(
) {
    const { data: session } = useSession();
    // const currentUserId = session?.user?.id ? Number(session.user.id) : undefined;
    const currentUserId = Number(48) //fortest

    const router = useRouter()
    const { date, startTime, endTime, sitterId = 10 } = router.query;

    let [activeNumber, setactiveNumber] = useState<number>(1);
    const [hasSelect, setHasSelect] = useState<boolean>(false);
    const [petName, setPetName] = useState<string>("-");
    const [pets, setPets] = useState<Pet[]>([])
    const [sitter, setSitter] = useState<Sitter>()
    const [sitterPetType, setSitterPetType] = useState<PetType[]>([])
    const [price, setPrice] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const [dataLoaded, setDataLoaded] = useState<boolean>(false) // เพิ่มตัวนี้

    const petstest: Pet[] = [
        { id: 1, name: "Bubba", petTypeId: 1, status: 'unselected' },
        { id: 2, name: "Daisy", petTypeId: 1, status: 'selected' },
        { id: 3, name: "I Som", petTypeId: 2, status: 'disabled' },
        { id: 4, name: "Noodle Birb", petTypeId: 3, status: 'unselected' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUserId) return;

            setLoading(true)
            try {
                // โหลด pets
                const petResult = await getPetById(currentUserId)
                setPets(petResult ?? [])

                // โหลด sitter
                const sitterResult = await getSitterById(Number(sitterId));

                console.log("sitterResult", sitterResult);

                let petType: PetType[] = [];
                sitterResult?.sitter_pet_type.map((item) => {
                    petType.push(item.pet_type)
                })

                setSitter(sitterResult)
                setSitterPetType(petType)
                setDataLoaded(true) // บอกว่าโหลดเสร็จแล้ว
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [currentUserId, sitterId])

    useEffect(() => {
        if (!dataLoaded || pets.length === 0) {
            if (sitterPetType.length === 0) {
                const updatedPets = pets.map((pet) => {
                    const isSupported = sitterPetType.some(type => pet.petTypeId === type.id);
                    return {
                        ...pet,
                        status: (isSupported ? "unselected" : "disabled") as PetStatus
                    };
                });

                setPets(updatedPets)
            }
        }
    }, [dataLoaded]);

    useEffect(() => {
        const countSelect = pets.filter(item => item.status === "selected");
        if (countSelect.length > 0) {
            setHasSelect(true);

            let str: string[] = []
            countSelect.map((item) => {
                str.push(item.name)
            },)
            setPrice((Number(sitter?.base_price) ?? 300)
                * countSelect.length)
            str.length === 0 ? setPetName("-") : setPetName(str.join(", "))
        }
        else {
            setHasSelect(false);
            setPetName("-")
        }
    }, [pets]);

    const handleBack = () => {
        if (activeNumber > 1) {
            setactiveNumber(prev => --prev);
        }
    }

    const handleNext = () => {
        if (activeNumber < 3) {
            setactiveNumber(prev => ++prev);
        }
    }

    return (
        <main className="container-1200 flex flex-col min-h-[calc(100vh-80px)] mx-auto bg-gray-1 px-4 py-8">
            <div className="flex flex-1 flex-col lg:flex-row gap-8">
                <div className="w-full flex flex-1 flex-col gap-5" >
                    {/* Left Side - Form */}
                    <div className="flex justify-center items-center bg-white rounded-2xl shadow-sm">
                        <ProgressStep activeNumber={activeNumber} />
                    </div>

                    <div className="flex flex-col flex-1 bg-white rounded-2xl ">
                        <div className="p-5 flex-1 overflow-auto">
                            {
                                activeNumber === 1 &&
                                (
                                    <div>
                                        <div
                                            className="bg-white rounded-2xl font-[500] text-[16px] py-2">
                                            Choose your pet
                                        </div>
                                        <BookingSelectYourPet
                                            pets={pets}
                                            setPets={setPets}
                                        />
                                    </div>
                                )
                            }
                            {
                                activeNumber === 2 &&
                                (<BookingInformation />)

                            }
                            {
                                activeNumber === 3 &&
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
                                onClick={handleBack}
                            >
                            </PrimaryButton>

                            <PrimaryButton
                                type="submit"
                                textColor="white"
                                bgColor="primary"
                                text={activeNumber === 3 ? "Confirm Booking" : "Next"}
                                onClick={handleNext}
                                disabled={!hasSelect}
                            >
                            </PrimaryButton>
                        </div>
                    </div>
                </div>

                {/* Right Side - Booking Detail */}
                <div className="w-full lg:w-[350px]">
                    <BookingSelectDetail
                        sitterName={sitter?.name ?? ""}
                        startTime={startTime}
                        endTime={endTime}
                        petName={petName}
                        price={price}
                    />
                </div>
            </div>
        </main >
    )
}
