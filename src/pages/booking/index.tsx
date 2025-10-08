import ProgressStep from "@/components/progress-step/ProgressStep"
import BookingInformation from "@/components/booking/BookingInformation"
import BookingSelectDetail from "@/components/booking/BookingDetail"
import PrimaryButton from "@/components/buttons/PrimaryButton";
import BookingSelectYourPet from "@/components/booking/BookingYourPet";
import { useEffect, useRef, useState } from "react";
import BookingSelectPayment from "@/components/booking/BookingPayment";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Pet, PetStatus } from "@/types/pet.types";
import { getPetById, getSitterById } from "@/lib/booking/booking-api";
import { PetType, Sitter } from "@/types/sitter.types";
import PageToaster from "@/components/ui/PageToaster";

interface informationType {
    name: "",
    email: "",
    phone: "",
    additional: ""
}

export default function Handler(
) {
    const hasFetched = useRef(false);
    const { data: session } = useSession();
    const currentUserId = session?.user?.id ? Number(session.user.id) : undefined;

    const router = useRouter()
    const { startTime, endTime, sitterId } = router.query;

    const parsedSitterId = sitterId ? Number(sitterId) : undefined;

    // const [sitterIdnew, setSitterIdnew] = useState<number | null>(null);
    const [activeNumber, setactiveNumber] = useState<number>(1);
    const [hasSelect, setHasSelect] = useState<boolean>(false);
    const [petName, setPetName] = useState<string>("-");
    const [pets, setPets] = useState<Pet[]>([])
    const [sitter, setSitter] = useState<Sitter>()
    // const [sitterPetType, setSitterPetType] = useState<PetType[]>([])
    const [price, setPrice] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const [refreshKey, setRefreshKey] = useState<number>(0) // เปลี่ยนชื่อให้ชัดเจน
    const [isFetching, setIsFetching] = useState(false);

    const [information, setInformation] = useState<informationType>(
        {
            name: "",
            email: "",
            phone: "",
            additional: ""
        }
    )

    const [error, setError] = useState<informationType>(
        {
            name: "",
            email: "",
            phone: "",
            additional: ""
        }
    )

    useEffect(() => {
        if (refreshKey > 0) {
            hasFetched.current = false;
        }
    }, [refreshKey]);

    useEffect(() => {
        // console.log("📥 useEffect triggered", {
        //     refreshKey,
        //     sitterId,
        //     parsedSitterId,
        //     currentUserId,
        //     hasFetched: hasFetched.current
        // });

        const fetchData = async () => {
            if (!currentUserId || !parsedSitterId || hasFetched.current) {
                return;
            }

            hasFetched.current = true;

            setLoading(true);
            try {
                const petResult = await getPetById();
                const sitterResult = await getSitterById(parsedSitterId);

                if (!sitterResult) {
                    return;
                }

                const petType: PetType[] = sitterResult.sitter_pet_type?.map(
                    (item) => item.pet_type
                ) || [];

                const updatedPets = (petResult ?? []).map((pet) => {
                    const isSupported = petType.some(type => pet.petTypeId === type.id);
                    return {
                        ...pet,
                        status: (isSupported ? "unselected" : "disabled") as PetStatus
                    };
                });

                setPets(updatedPets);
                setSitter(sitterResult);
            } catch (error) {
                console.error("❌ Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUserId, parsedSitterId, refreshKey]);

    useEffect(() => {
        const countSelect = pets.filter(item => item.status === "selected");
        if (countSelect.length > 0) {
            setHasSelect(true);

            const str: string[] = []
            countSelect.forEach((item) => {
                str.push(item.name)
            })

            setPrice((Number(sitter?.base_price) || 310)
                * countSelect.length)
            setPetName(str.length === 0 ? "-" : str.join(", "))
        }
        else {
            setHasSelect(false);
            setPetName("-")
            setPrice(0)
        }
    }, [pets, sitter?.base_price]);

    const handleRefreshPets = () => {
        setRefreshKey(prev => prev + 1);
    }

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
                                            onRefresh={handleRefreshPets}
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
