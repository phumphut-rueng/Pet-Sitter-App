import { useState } from "react";
import { Pagination } from "@/components/pagination/Pagination";
import ProgressBar from "@/components/progressStep/ProgressBar";
import ProgressStep from "@/components/progressStep/ProgressStep";
import BookingConfirmation from "@/components/modal/BookingConfirmation";
import RejectConfirmation from "@/components/modal/RejectConfirmation";
import RatingSelect from "@/components/ratingStar";
import PrimaryButton from "@/components/buttons/primaryButton";
import InputText from "@/components/input/InputText";
import InputTextArea from "@/components/input/InputTextArea";
import { PetTypeBadge } from "@/components/badges/pettypebadge";
import { StatusBadge } from "@/components/badges/statusbadge";
import ImageGallery from "@/components/form/imagegalleryupload";
import AvatarUploader from "@/components/form/avatarupload";
import { cn } from "@/lib/utils";
import PinSelection from "@/components/PinSelection";
import ChatList from "@/components/Chat/ChatList";
import ChatContainer from "@/components/Chat/ChatContainer";
import PetTypeCheckBox from "@/components/petTypeCheckBox";
import CashButton from "@/components/buttons/cashButton";
import IconButton from "@/components/buttons/iconButton";


// Section Wrapper
const Section = ({ title, cols = 2, children }: {
    title: string;
    cols?: number;
    children: React.ReactNode
}) => (
    <div className="space-y-4">
        <h2 className="text-xl font-bold text-center text-orange-5">{title}</h2>
        <div className={cn("grid gap-4", `sm:grid-cols-${cols}`)}>{children}</div>
    </div>
);

// SubSection Card
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
                {/* Rating */}
                <Section title="Selection">
                    <SubSection title="Checkbox - Radio [คุณเอป]">
                    <PetTypeCheckBox layout="column"/>
                    </SubSection>
                    <SubSection title="Rating">
                        {/* 
                        value = Rating
                        */}
                        <RatingSelect
                            value={1}
                        />
                        <RatingSelect
                            value={5}
                        />
                    </SubSection>
                    <SubSection title="Pin Selection">
                        <PinSelection/>
                    </SubSection>
                    <SubSection title="Payment Selection [คุณเอป]">
                        <CashButton/>
                    </SubSection>
                </Section>

                {/* Icon */}
                <Section title="Icon">
                    <SubSection title="[เดี๋ยวเอามาใส่]">
                        <></>
                    </SubSection>
                </Section>

                {/* Button */}
                <Section title="Button" cols={1}>
                    <SubSection title="">
                        {/* 
                        วิธีใช้ เลือกสี bg ปุ่มได้เฉพาะใน bgColorMap และ textColor ได้เฉพาะใน textColorMap ถ้าอยากใช้สีอื่นต้อมาเพิ่มในนี้ก่อน
                        //สามารถเพิ่มเขียน override className ได้ เช่น เเก้ความยาวปุ่มด้วย px
                        */}
                        <PrimaryButton
                            text="facebook"
                            srcImage="/icons/fbIcon.svg"
                            bgColor="primary"
                            textColor="white"
                            className="px-16"
                        />
                        <PrimaryButton
                            text="facebook"
                            srcImage="/icons/fbIcon.svg"
                            bgColor="secondary"
                            textColor="orange"
                            className="px-16"
                        />
                        <PrimaryButton
                            text="facebook"
                            srcImage="/icons/fbIcon.svg"
                            bgColor="ghost"
                            textColor="orange"
                            className="px-16"
                        />
                        <PrimaryButton
                            text="facebook"
                            srcImage="/icons/fbIcon.svg"
                            bgColor="gray"
                            textColor="black"
                            className="px-16"
                        />
                        <IconButton icon="/icons/note.svg" />
                    </SubSection>
                </Section>

                {/* Input */}
                <Section title="Input" cols={1}>
                    <SubSection title="Input Field">
                        <InputText
                            label="Normal"
                            placeholder="placeholder"
                            type="text"
                            variant="default"
                        />
                        <InputText
                            label="Success"
                            placeholder="placeholder"
                            type="text"
                            variant="success"
                        />
                        <InputText
                            label="error"
                            placeholder="placeholder"
                            type="text"
                            variant="error"
                        />
                        <InputText
                            label="disabled"
                            placeholder="placeholder"
                            type="text"
                            variant="default"
                            disabled={true}
                        />
                        <InputTextArea
                            label="TextArea"
                            placeholder="placeholder"
                        />
                    </SubSection>
                </Section>

                {/* Upload Image */}
                <Section title="Upload Image">
                    <SubSection title="Upload Image">
                        {/* 
                        currentPage = หน้าที่เลือกอยู่
                        totalPages = หน้าทั้งหมด
                        */}
                        <ImageGallery
                        />
                    </SubSection>
                    <SubSection title="Avatar">
                        {/* 
                        currentPage = หน้าที่เลือกอยู่
                        totalPages = หน้าทั้งหมด
                        */}
                        <AvatarUploader
                        />
                    </SubSection>
                </Section>

                {/* Badge */}
                <Section title="Badge">
                    {/* 
                    status = ชื่อ
                    */}
                    <SubSection title="Booking Status">
                        <StatusBadge
                            status="waitingConfirm"
                        />
                        <StatusBadge
                            status="waitingService"
                        />
                        <StatusBadge
                            status="inService"
                        />
                        <StatusBadge
                            status="success"
                        />
                    </SubSection>

                    <SubSection title="Pet Sitter Status">
                        <StatusBadge
                            status="waitingApprove"
                        />
                        <StatusBadge
                            status="approved"
                        />
                        <StatusBadge
                            status="rejected"
                        />
                    </SubSection>

                    <SubSection title="Pet OwnerStatus">
                        <StatusBadge
                            status="normal"
                        />
                        <StatusBadge
                            status="banned"
                        />
                    </SubSection>

                    <SubSection title="Report Status">
                        <StatusBadge
                            status="newReport"
                        />
                        <StatusBadge
                            status="pending"
                        />
                        <StatusBadge
                            status="resolved"
                        />
                    </SubSection>

                    <SubSection title="Pet Type">
                        {/* 
                        typeKey = ชื่อ
                        */}
                        <PetTypeBadge
                            typeKey="dog"
                        />
                        <PetTypeBadge
                            typeKey="cat"
                        />
                        <PetTypeBadge
                            typeKey="bird"
                        />
                        <PetTypeBadge
                            typeKey="rabbit"
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

                {/* Card */}
                <Section title="Card ">
                    <SubSection title="รอคุณยู">
                        <></>
                    </SubSection>
                </Section>

                {/* Pagination */}
                <Section title="Pagination">
                    <SubSection title="">
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

                {/* Chat */}
                <Section title="Chat">
                    <SubSection title="Chat List and Chat Container">
                        <div className="flex flex-row gap-4">
                            <ChatList/>
                            <ChatContainer/>
                        </div>
                    </SubSection>
                </Section>
            </div>
        </div>
    );
}
