import { useState } from "react";
import { Pagination } from "@/components/pagination/Pagination";
import ProgressBar from "@/components/progressStep/ProgressBar";
import ProgressStep from "@/components/progressStep/ProgressStep";
import BookingConfirmation from "@/components/modal/BookingConfirmation";
import RejectConfirmation from "@/components/modal/RejectConfirmation";

// 🔹 Section Wrapper
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-4">
        <h2 className="text-xl font-bold text-center text-orange-5">{title}</h2>
        <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
);

// 🔹 SubSection Card
const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="p-4 border border-orange-5 rounded-lg  shadow-sm">
        <p className="text-sm font-semibold text-gray-6 mb-2">{title}</p>
        <div className="flex flex-wrap justify-center gap-3">{children}</div>
    </div>
);

export default function ComponentAll() {
    const [isOpenBooking, setIsOpenBooking] = useState(false);
    const [isOpenReject, setIsOpenReject] = useState(false);

    return (
        <div className="min-h-screen text-white p-6">
            <div className=" mx-auto space-y-10">
                {/* Pagination */}
                <Section title="Pagination">
                    <SubSection title="Example">
                        {/* 
                        currentPage = หน้าที่เลือกอยู่
                        totalPages = หน้าทั้งหมด
                        */}
                        <Pagination
                            currentPage={5}
                            totalPages={45}
                        />
                    </SubSection>
                </Section>

                {/* Progress */}
                <Section title="Progress">
                    <SubSection title="Progress Bar">
                        {/* 
                        number = เลขในวงกลม
                        label = ตัวหนังสือ
                        status = สีของวงกลม
                        */}
                        <ProgressBar
                            label="Booking"
                            status="active"
                        />
                        <ProgressBar
                            number={2}
                            label="Payment"
                            status="inactive"
                        />
                        <ProgressBar
                            number={3}
                            label="Done"
                            status="done"
                        />
                    </SubSection>

                    <SubSection title="Progress Step">
                        {/* 
                        activeNumner = วงที่กลมที่กำลัง active อยู่
                        */}
                        <ProgressStep
                            activeNumner={2} />
                    </SubSection>
                </Section>

                {/* Modal */}
                <Section title="Modal">
                    {/* 
                    สร้าง button เอามาไว้กดเรียกใช้ popup เฉยๆ
                    component นี้ต้องใช้กับ useState
                    */}
                    <SubSection title="Confirmation">
                        <button
                            className="bg-orange-5 text-white px-3 py-1 rounded hover:bg-orange-4 text-sm"
                            onClick={() => setIsOpenBooking(true)}
                        >
                            Booking
                        </button>
                        <button
                            className="bg-orange-5 text-white px-3 py-1 rounded hover:bg-orange-4 text-sm"
                            onClick={() => setIsOpenReject(true)}
                        >
                            Reject
                        </button>
                    </SubSection>

                    {/* 
                    open = ค่าที่เอาไว้สั่ง เปิด/ปิด
                    onOpenChange = เอาไว้ใช้กับ X
                    onConfirm = กด Confirm แล้วให้ทำอะไร
                    */}
                    <BookingConfirmation
                        open={isOpenBooking}
                        onOpenChange={setIsOpenBooking}
                        onConfirm={() => console.log("Booking confirmed")}
                    />
                    <RejectConfirmation
                        open={isOpenReject}
                        onOpenChange={setIsOpenReject}
                        onConfirm={() => console.log("Rejected")}
                    />
                </Section>
            </div>
        </div>
    );
}
