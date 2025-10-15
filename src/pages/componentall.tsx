import { useState } from "react";
import { Pagination } from "@/components/pagination/Pagination";
import ProgressBar from "@/components/progress-step/ProgressBar";
import ProgressStep from "@/components/progress-step/ProgressStep";
import BookingConfirmation from "@/components/modal/BookingConfirmation";
import RejectConfirmation from "@/components/modal/RejectConfirmation";
import RatingSelect from "@/components/ratingStar";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import InputText from "@/components/input/InputText";
import InputTextArea from "@/components/input/InputTextArea";
import { PetTypeBadge } from "@/components/badges/PetTypeBadge";
import { StatusBadge } from "@/components/badges/StatusBadge";
import ImageGallery from "@/components/form/ImageGalleryUpload";
import AvatarUploader from "@/components/form/AvatarUpload";
import PinSelection from "@/components/PinSelection";
import ChatWidget from "@/components/widgets/ChatWidget";
import PetTypeCheckBox from "@/components/petTypeCheckBox";
import CashButton from "@/components/buttons/CashButton";
import IconButton from "@/components/buttons/IconButton";
import {
  PetSitterCard as _PetSitterCard,
  PetSitterCardLarge,
  PetSitterCardSmall,
} from "@/components/cards/PetSitterCard";
import BookingCard from "@/components/cards/BookingCard";
import PetCard from "@/components/cards/PetCard";
import AccountSidebarMini from "@/components/layout/AccountSidebarMini";
import BookingSelect from "@/components/booking/BookingSelect";
import DatePicker from "@/components/date-picker/DatePicker";
import TimePicker from "@/components/time-picker/TimePicker";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SitterSidebar from "@/components/layout/SitterSidebar";
import CreateNewPetCard from "@/components/cards/CreateNewPetCard";
import { Section, SubSection } from "@/components/component-all/ComponentAllStyle";
import { PetPawLoading } from "@/components/loading/PetPawLoading";

// Sidebar Demo
const SidebarDemo: React.FC = () => {
  return (
      <div className="flex h-[520px] overflow-hidden rounded-xl border border-border">
      <SitterSidebar sticky={false} />
      <main className="flex-1 bg-white" />
    </div>
  );
};

// Assets
const COVER = "/images/cards/pet-sitter-cover.svg";
const AVATAR = "/images/cards/jane-maison.svg";
const PETIMG = "/images/cards/pet-cat-mr-hem-card.svg";

// Mock data
const pets = [
  { id: 1, name: "Mr. Ham", selected: false },
  { id: 2, name: "Mr. Ham", selected: true },
  { id: 3, name: "Mr. Ham", disabled: true },
  { id: 4, name: "Mr. Ham" },
];

const sitterCommon = {
  title: "Happy House!",
  hostName: "Jame Maison",
  location: "Senanikom, Bangkok",
  coverUrl: COVER,
  avatarUrl: AVATAR,
};

const bookingBase = {
  title: "Happy House!",
  sitterName: "Jane Maison",
  avatarUrl: "/images/cards/jane-maison.svg",
  transactionDate: "Tue, 16 Aug 2023",
  dateTime: "25 Aug, 2023  |  7 AM – 10 AM",
  duration: "3 hours",
  pet: "Mr.Ham, Bingsu",
};

const disabledDates = [
  new Date(2025, 9, 10),
  new Date(2025, 9, 16),
  new Date(2025, 9, 20),
];

const on = (k: string) => () => console.log(k);

// Pet Card Grid Component
function PetCardGrid() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold mb-3">Pet Cards — Large (207×240)</h2>
        <div className="grid grid-cols-4 gap-4 min-w-0">
          {pets.map((p) => (
            <div key={`lg-${p.id}`} className="min-w-0 flex justify-center">
              <PetCard
                name={p.name}
                species="Cat"
                img={PETIMG}
                selected={p.selected}
                disabled={p.disabled}
                width={207}
                height={240}
                avatarSize={104}
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Pet Cards — Compact (180×209)</h2>
        <div className="grid grid-cols-4 gap-4 min-w-0">
          {pets.map((p) => (
            <div key={`sm-${p.id}`} className="min-w-0 flex justify-center">
              <PetCard
                name={p.name}
                species="Cat"
                img={PETIMG}
                selected={p.selected}
                disabled={p.disabled}
                width={180}
                height={209}
                avatarSize={96}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function ComponentAll() {
  const [isOpenBooking, setIsOpenBooking] = useState(false);
  const [isOpenReject, setIsOpenReject] = useState(false);
  const [isOpenPopup, setIsOpenPopup] = useState(false);
  const [isOpenBookingSelect, setIsOpenBookingSelect] = useState(false);

  const [date1, setDate1] = useState<Date | undefined>();
  const [month1, setMonth1] = useState<Date | undefined>(new Date());
  const [date2, setDate2] = useState<Date | undefined>();
  const [month2, setMonth2] = useState<Date | undefined>(new Date());
  const [date4, setDate4] = useState<Date | undefined>();
  const [month4, setMonth4] = useState<Date | undefined>(new Date());

  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [startTime2] = useState<Date | undefined>(undefined);
  const [endTime2, setendTime2] = useState<Date | undefined>(undefined);

  void _PetSitterCard;

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mx-auto space-y-10">
        {/* Rating */}
        <Section title="Selection" cols={4}>
          <SubSection title="Checkbox - Radio [คุณเอป]">
            <PetTypeCheckBox layout="column" />
          </SubSection>
          <SubSection title="Rating">
            <RatingSelect value={1} />
            <RatingSelect value={5} />
          </SubSection>
          <SubSection title="Pin Selection">
            <PinSelection />
          </SubSection>
          <SubSection title="Payment Selection [คุณเอป]">
            <CashButton />
          </SubSection>
        </Section>

        {/* Button */}
        <Section title="Button" cols={1}>
          <SubSection title="">
            <PrimaryButton text="facebook" srcImage="/icons/fbIcon.svg" bgColor="primary" textColor="white" className="px-16" />
            <PrimaryButton text="facebook" srcImage="/icons/fbIcon.svg" bgColor="secondary" textColor="orange" className="px-16" />
            <PrimaryButton text="facebook" srcImage="/icons/fbIcon.svg" bgColor="ghost" textColor="orange" className="px-16" />
            <PrimaryButton text="facebook" srcImage="/icons/fbIcon.svg" bgColor="gray" textColor="black" className="px-16" />
            <IconButton icon="/icons/note.svg" />
          </SubSection>
        </Section>

        {/* Input */}
        <Section title="Input" cols={1}>
          <SubSection title="Input Field">
            <InputText label="Normal" placeholder="placeholder" type="text" variant="default" />
            <InputText label="Success" placeholder="placeholder" type="text" variant="success" />
            <InputText label="error" placeholder="placeholder" type="text" variant="error" />
            <InputText label="disabled" placeholder="placeholder" type="text" variant="default" disabled={true} />
            <InputTextArea label="TextArea" placeholder="placeholder" />
          </SubSection>
        </Section>

        {/* Upload Image */}
        <Section title="Upload Image">
          <SubSection title="Upload Image">
            <ImageGallery />
            <AvatarUploader />
            <CreateNewPetCard height={18} className="w-[170px]" />
          </SubSection>
        </Section>

        {/* Badge */}
        <Section title="Badge" cols={2}>
          <SubSection title="Booking Status">
            <StatusBadge status="waitingConfirm" />
            <StatusBadge status="waitingService" />
            <StatusBadge status="inService" />
            <StatusBadge status="success" />
          </SubSection>

          <SubSection title="Pet Sitter Status">
            <StatusBadge status="waitingApprove" />
            <StatusBadge status="approved" />
            <StatusBadge status="rejected" />
          </SubSection>

          <SubSection title="Pet OwnerStatus">
            <StatusBadge status="normal" />
            <StatusBadge status="banned" />
          </SubSection>

          <SubSection title="Report Status">
            <StatusBadge status="newReport" />
            <StatusBadge status="pending" />
            <StatusBadge status="resolved" />
          </SubSection>

          <SubSection title="Pet Type">
            <PetTypeBadge typeKey="dog" />
            <PetTypeBadge typeKey="cat" />
            <PetTypeBadge typeKey="bird" />
            <PetTypeBadge typeKey="rabbit" />
          </SubSection>
        </Section>

        {/* Progress */}
        <Section title="Progress" cols={2}>
          <SubSection title="Progress Bar">
            <ProgressBar label="Booking" status="active" />
            <ProgressBar number={2} label="Payment" status="inactive" />
            <ProgressBar number={3} label="Done" status="done" />
          </SubSection>

          <SubSection title="Progress Step">
            <ProgressStep activeStep={2} />
          </SubSection>

          <SubSection title="Pagination">
            <Pagination currentPage={5} totalPages={45} />
          </SubSection>
        </Section>

        {/* Sidebar */}
        <Section title="Sidebar">
          <SubSection title="">
            <SidebarDemo />
            <AccountSidebarMini />
            <AdminSidebar sticky={false} />
            <SitterSidebar sticky={false} />
          </SubSection>
        </Section>

        {/* Card System - แก้ไขให้เรียงเป็นคอลัมน์ */}
        void _PetSitterCard;
        <Section title="card เกือบเสร็จ ขาดนิดเดียว 😅" cols={1}>
          {/* Pet Cards */}
          <SubSection title="Pet Cards">
            <PetCardGrid />
          </SubSection>

          {/* Pet Sitter Large */}
          <SubSection title="Pet Sitter – Large">
            <div className="space-y-6">
              {/* Desktop: รูปซ้าย */}
              <div className="flex flex-col items-center gap-4">
                <PetSitterCardLarge 
                  {...sitterCommon} 
                  rating={5} 
                  className="w-full max-w-[848px] min-h-[216px] cursor-pointer" 
                  tags={["Dog", "Cat", "Rabbit"]} 
                />
                <PetSitterCardLarge 
                  {...sitterCommon} 
                  rating={5} 
                  className="w-full max-w-[848px] min-h-[216px] cursor-pointer border-[1px] border-orange-5" 
                  tags={["Dog", "Cat", "Rabbit"]} 
                />
              </div>

              {/* Desktop: รูปบน (cover layout) */}
              <div className="flex justify-center">
                <PetSitterCardLarge 
                  {...sitterCommon} 
                  lgLayout="cover" 
                  rating={5} 
                  className="w-full max-w-[335px] cursor-pointer min-h-[268px]" 
                  tags={["Dog", "Cat", "Rabbit"]} 
                />
              </div>
            </div>
          </SubSection>

          {/* Pet Sitter Small */}
<SubSection title="Pet Sitter – Small">
  <div className="flex flex-col items-center gap-6 w-full">
    {/* Wide card แบบปกติ */}
    <PetSitterCardSmall 
      {...sitterCommon} 
      rating={5} 
      smPreset="wide" 
      tags={["Dog", "Cat", "Bird", "Rabbit"]} 
    />
    
    {/* Compact card แบบปกติ */}
    <PetSitterCardSmall 
      {...sitterCommon} 
      rating={5} 
      smPreset="compact" 
      tags={["Dog", "Cat", "Bird", "Rabbit"]} 
    />
    
    {/* Wide card มีกรอบส้ม */}
    <PetSitterCardSmall 
      {...sitterCommon} 
      rating={5} 
      smPreset="wide" 
      className="border-[1px] border-orange-6" 
      tags={["Dog", "Cat", "Bird", "Rabbit"]} 
    />
    
    {/* Compact card มีกรอบส้ม */}
    <PetSitterCardSmall 
      {...sitterCommon} 
      rating={5} 
      smPreset="compact" 
      className="border-[1px] border-orange-6" 
      tags={["Dog", "Cat", "Bird", "Rabbit"]} 
    />
  </div>
</SubSection>

          {/* Booking Cards Desktop */}
          <SubSection title="Booking Cards Desktop">
            <div className="flex flex-col items-center gap-4 w-full">
              <BookingCard
                {...bookingBase}
                status="waiting"
                layout="wide"
                note="Waiting Pet Sitter for confirm booking"
                actions={[
                  { key: "message", label: "Send Message", onClick: on("message") },
                  { key: "change", label: "Change", onClick: on("change") },
                  { key: "call", label: "Call", onClick: on("call") },
                ]}
              />

              <BookingCard
                {...bookingBase}
                status="in_service"
                layout="wide"
                note="Your pet is already in Pet Sitter care!"
                actions={[
                  { key: "message", onClick: on("message") },
                  { key: "call", onClick: on("call") },
                ]}
              />

              <BookingCard
                {...bookingBase}
                status="success"
                layout="wide"
                successDate="Tue, 25 Oct 2022  |  11:03 AM"
                actions={[
                  { key: "report", label: "Report", onClick: on("report") },
                  { key: "review", label: "Review", onClick: on("review") },
                  { key: "call", onClick: on("call") },
                ]}
              />

              <BookingCard
                {...bookingBase}
                status="success"
                layout="wide"
                successDate="Tue, 25 Oct 2022  |  11:03 AM"
                actions={[
                  { key: "report", label: "Report", onClick: on("report") },
                  { key: "review", label: "Your Review", onClick: on("review") },
                  { key: "call", onClick: on("call") },
                ]}
              />
            </div>
          </SubSection>

          {/* Booking Cards Mobile */}
          <SubSection title="Booking Cards Mobile">
            <div className="flex flex-col items-center gap-4">
              <div className="w-full max-w-[375px]">
                <BookingCard
                  {...bookingBase}
                  layout="compact"
                  status="waiting"
                  note="Waiting Pet Sitter for confirm booking"
                  actions={[
                    { key: "message", label: "Send Message", onClick: on("message") },
                    { key: "change", label: "Change", onClick: on("change") },
                    { key: "call", label: "Call", onClick: on("call") },
                  ]}
                />
              </div>

              <div className="w-full max-w-[375px]">
                <BookingCard
                  {...bookingBase}
                  layout="compact"
                  status="in_service"
                  note="Your pet is already in Pet Sitter care!"
                  actions={[
                    { key: "message", onClick: on("message") },
                    { key: "call", onClick: on("call") },
                  ]}
                />
              </div>

              <div className="w-full max-w-[375px]">
                <BookingCard
                  {...bookingBase}
                  layout="compact"
                  status="success"
                  successDate="Tue, 25 Oct 2022  |  11:03 AM"
                  actions={[
                    { key: "report", label: "Report", onClick: on("report") },
                    { key: "review", label: "Review", onClick: on("review") },
                    { key: "call", onClick: on("call") },
                  ]}
                />
              </div>

              <div className="w-full max-w-[375px]">
                <BookingCard
                  {...bookingBase}
                  layout="compact"
                  status="success"
                  successDate="Tue, 25 Oct 2022  |  11:03 AM"
                  actions={[
                    { key: "report", label: "Report", onClick: on("report") },
                    { key: "review", label: "Your Review", onClick: on("review") },
                    { key: "call", onClick: on("call") },
                  ]}
                />
              </div>
            </div>
          </SubSection>
        </Section>

        {/* Modal */}
        <Section title="Modal">
          <SubSection title="Confirmation">
            <PrimaryButton text="Booking Click!!" bgColor="primary" textColor="white" onClick={() => setIsOpenBooking(true)} />
            <PrimaryButton text="Reject Click!!" bgColor="primary" textColor="white" onClick={() => setIsOpenReject(true)} />
            <PrimaryButton text="Popup Click!!" bgColor="secondary" textColor="orange" onClick={() => setIsOpenPopup(true)} />
            <PrimaryButton text="Booking Select Click!!" bgColor="primary" textColor="white" onClick={() => setIsOpenBookingSelect(true)} />
          </SubSection>

          <BookingConfirmation open={isOpenBooking} onOpenChange={setIsOpenBooking} onConfirm={() => console.log("Booking confirmed")} />
          <RejectConfirmation open={isOpenReject} onOpenChange={setIsOpenReject} onConfirm={() => console.log("Rejected")} />
          <BookingConfirmation title="title" description="description" textButton="textButton" open={isOpenPopup} onOpenChange={setIsOpenPopup} onConfirm={() => console.log("Popup confirmed")} />
          <BookingSelect sitterId={15} open={isOpenBookingSelect} onOpenChange={setIsOpenBookingSelect} disabledDates={disabledDates} />
        </Section>

        {/* Date Picker */}
        <Section title="Date Picker - Time Picker" cols={2}>
          <SubSection title="Date">
            <div className="w-[250px]">
              <span className="text-gray-6">แบบไม่มีเงื่อนไข</span>
              <DatePicker date={date1} month={month1} onMonthChange={setMonth1} onSelect={setDate1} />
            </div>
            <div className="w-[250px]">
              <span className="text-gray-6">กำหนด min/max date</span>
              <DatePicker
                date={date2}
                month={month2}
                onMonthChange={setMonth2}
                onSelect={setDate2}
                rules={{ minDate: new Date(1950, 1, 1), maxDate: new Date(2026, 1, 1) }}
              />
            </div>
            <div className="w-[250px]">
              <span className="text-gray-6">กำหนดวันที่ต้องการ disable</span>
              <DatePicker date={date4} month={month4} onMonthChange={setMonth4} onSelect={setDate4} disabledDatesSlots={disabledDates} />
            </div>
          </SubSection>

          <SubSection title="Time">
            <div className="w-[250px]">
              <span className="text-gray-6">แบบไม่มีเงื่อนไข</span>
              <TimePicker value={startTime} onChange={setStartTime} placeholder="Start time" />
            </div>
            <div className="w-[250px]">
              <span className="text-gray-6">ไม่โชว์เวลาที่ผ่านมาแล้ว</span>
              <TimePicker
                value={endTime2}
                onChange={setendTime2}
                date={new Date()}
                startDate={startTime2}
                startTimeValue={startTime2}
                rules={{
                  disablePastTime: true,
                  showDisabledSlots: false,
                  showPastStartTime: true,
                  showPastTime: false,
                }}
              />
            </div>
            <div className="w-[250px]">
              <span className="text-gray-6">กำหนดเวลาไม่ให้แสดง</span>
              <TimePicker
                value={endTime2}
                onChange={setendTime2}
                date={new Date()}
                disabledTimeSlots={[
                  {
                    // ISO string
                    date_start: "2025-10-15T08:30:00Z",
                    date_end: "2025-10-15T09:30:00Z"
                  },
                  // {
                  //   // Date object
                  //   date_start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 9, 0),
                  //   date_end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 10, 0)
                  // }
                ]}
                rules={{ showDisabledSlots: true }}
              />
            </div>
          </SubSection>
        </Section>

        {/* Loading */}
        <Section title="Loading">
          <SubSection title="Loading">
            <PetPawLoading message="Loading Pet" size="lg" baseStyleCustum="flex items-center justify-center w-full h-full" />
          </SubSection>
        </Section>

        {/* Chat */}
        <Section title="Chat">
          <SubSection title="Chat Widget">
            <div className="w-full h-[calc(100vh-90px)]">
              <ChatWidget />
            </div>
          </SubSection>
        </Section>
      </div>
    </div>
  );
}