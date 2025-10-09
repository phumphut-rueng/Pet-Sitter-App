import * as React from "react";
import { PetFormProps, PetFormValues } from "@/types/pet.types";
import { 
  EMPTY_PET_FORM_VALUES, 
  PET_FORM_FIELDS, 
  PET_TYPE_OPTIONS, 
  PET_SEX_OPTIONS,
  PET_FORM_STYLES 
} from "./pet-form.config";
import { 
  fileToDataURL, 
  sanitizeAgeInput, 
  sanitizeWeightInput 
} from "@/lib/pet/pet-utils";
import { TextInputField } from "@/components/fields/TextInputField";
import { SelectField } from "@/components/fields/SelectField";
import { TextAreaField } from "@/components/fields/TextAreaField";
import { PetImageField } from "@/components/fields/PetImageField";
import { ActionButtons } from "@/components/fields/ActionButtons";

/*แสดงข้อความ Error จาก Server*/
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className={PET_FORM_STYLES.error}>{message}</div>
);

/*ปุ่มลบสัตว์เลี้ยง (แสดงตอน Edit mode เท่านั้น)*/
const DeleteButton: React.FC<{ onDelete: () => void }> = ({ onDelete }) => (
  <div className="mt-2 flex justify-center md:justify-start">
    <button type="button" onClick={onDelete} className={PET_FORM_STYLES.button.delete}>
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 3h6a1 1 0 0 1 1 1v1h4v2H4V5h4V4a1 1 0 0 1 1-1Zm2 4h2v12h-2V7ZM7 7h2v12H7V7Zm8 0h2v12h-2V7Z" />
      </svg>
      Delete Pet
    </button>
  </div>
);

/**ฟอร์มสำหรับสร้าง/แก้ไขข้อมูลสัตว์เลี้ยง
 * 
 * Props:
 * - mode: "create" (สร้างใหม่) หรือ "edit" (แก้ไข)
 * - initialValues: ค่าเริ่มต้นของฟอร์ม (ใช้ตอนแก้ไข)
 * - loading: สถานะ loading (ปิดปุ่มขณะกำลังบันทึก)
 * - serverError: ข้อความ error จาก server
 * - onSubmit: ฟังก์ชันที่เรียกเมื่อกด Submit
 * - onCancel: ฟังก์ชันที่เรียกเมื่อกด Cancel
 * - onDelete: ฟังก์ชันที่เรียกเมื่อกด Delete (optional)
 */
export default function PetForm({
  mode,
  initialValues,
  loading = false,
  serverError,
  onSubmit,
  onCancel,
  onDelete,
}: PetFormProps) {
  
  // State: เก็บค่าทุก field ในฟอร์ม
  const [values, setValues] = React.useState<PetFormValues>({
    ...EMPTY_PET_FORM_VALUES,  // ค่าว่างเริ่มต้น
    ...initialValues,          // ถ้ามีค่าเริ่มต้น (edit mode) ให้ใช้ค่านั้น
  });

  // เมื่อ initialValues เปลี่ยน ให้ update state
  // (ใช้ตอนโหลดข้อมูลสัตว์เลี้ยงมาแก้ไข)
  React.useEffect(() => {
    if (!initialValues) return;
    setValues((prev) => ({ ...prev, ...initialValues }));
  }, [initialValues]);



  /*จัดการเมื่อพิมพ์/เลือกค่าใน input, select, textarea*/
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // ถ้าเป็นช่องอายุ (ageMonth) ให้เก็บเฉพาะตัวเลข 0-999
    if (name === "ageMonth") {
      const cleanedAge = sanitizeAgeInput(value); // ฟังก์ชันกรองให้เหลือแต่ตัวเลข
      setValues((prev) => ({ ...prev, ageMonth: cleanedAge }));
      return;
    }

    // ⚖️ ถ้าเป็นช่องน้ำหนัก (weightKg) อนุญาตทศนิยม และจำกัดไม่เกิน 100kg
    if (name === "weightKg") {
      const cleanedWeight = sanitizeWeightInput(value); // กรองให้เหลือตัวเลข + จุด
      setValues((prev) => ({ ...prev, weightKg: cleanedWeight }));
      return;
    }

    //  ช่องอื่นๆ → เก็บค่าตามปกติ
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  /* จัดการเมื่อเลือกรูปภาพสัตว์เลี้ยง*/
  const handleImageChange = async (file: File | null) => {
    // ถ้าไม่มีไฟล์ (ลบรูป) → ตั้งค่าเป็นว่าง
    if (!file) {
      setValues((prev) => ({ ...prev, image: "" }));
      return;
    }
    
    // แปลงไฟล์รูปเป็น base64 (data URL) เพื่อแสดง preview
    const dataURL = await fileToDataURL(file);
    setValues((prev) => ({ ...prev, image: dataURL }));
  };

  /**จัดการเมื่อกด Submit Form*/
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันไม่ให้ refresh หน้า
    onSubmit(values);   // ส่งค่าทั้งหมดไปให้ parent component
  };

  // ===Render UI// 

  const isEdit = mode === "edit";              // เช็คว่าเป็นโหมดแก้ไขหรือไม่
  const showDelete = onDelete && isEdit;       // แสดงปุ่มลบเฉพาะตอนแก้ไข

  return (
    <form onSubmit={handleSubmit} className={PET_FORM_STYLES.form} aria-label="Pet form">
      
      {/*  แสดง Error Message ถ้ามี */}
      {serverError && <ErrorMessage message={serverError} />}

      {/*  Layout: รูป + ฟอร์ม */}
      <div className={PET_FORM_STYLES.grid.main}>
        
        {/*  ช่องอัพโหลดรูปสัตว์เลี้ยง */}
        <PetImageField 
          imageUrl={values.image} 
          onChange={handleImageChange} 
        />

        {/*  ส่วนฟอร์มทั้งหมด */}
        <div className="grid gap-4">
          
          {/*  Input Fields (Grid 2 คอลัมน์) */}
          <div className={PET_FORM_STYLES.grid.fields}>
            
            {/* ชื่อสัตว์เลี้ยง */}
            <TextInputField
              config={PET_FORM_FIELDS.name}
              value={values.name}
              onChange={handleInputChange}
              autoComplete="off"
            />
            
            {/* สายพันธุ์ */}
            <TextInputField
              config={PET_FORM_FIELDS.breed}
              value={values.breed}
              onChange={handleInputChange}
              autoComplete="off"
            />
            
            {/* อายุ (เดือน) - รับเฉพาะตัวเลข */}
            <TextInputField
              config={PET_FORM_FIELDS.ageMonth}
              value={values.ageMonth}
              onChange={handleInputChange}
              pattern="[0-9]*"
              autoComplete="off"
            />
            
            {/* สี */}
            <TextInputField
              config={PET_FORM_FIELDS.color}
              value={values.color}
              onChange={handleInputChange}
              autoComplete="off"
            />
            
            {/* น้ำหนัก (กก.) - รับทศนิยมได้ */}
            <TextInputField
              config={PET_FORM_FIELDS.weightKg}
              value={values.weightKg}
              onChange={handleInputChange}
              autoComplete="off"
            />
            
            {/* ประเภทสัตว์ (Dropdown) */}
            <SelectField
              name="type"
              label="Pet Type*"
              value={values.type}
              options={PET_TYPE_OPTIONS}
              onChange={handleInputChange}
            />
            
            {/* เพศ (Dropdown) */}
            <SelectField
              name="sex"
              label="Sex*"
              value={values.sex}
              options={PET_SEX_OPTIONS}
              onChange={handleInputChange}
            />
          </div>

          {/*  TextArea: เกี่ยวกับสัตว์เลี้ยง */}
          <TextAreaField 
            value={values.about} 
            onChange={handleInputChange} 
          />

          {/* ปุ่มลบ (แสดงเฉพาะตอนแก้ไข) */}
          {showDelete && <DeleteButton onDelete={onDelete} />}

          {/*  ปุ่ม Cancel & Submit */}
          <ActionButtons 
            mode={mode} 
            loading={loading} 
            onCancel={onCancel} 
            isMobile 
          />
          <ActionButtons 
            mode={mode} 
            loading={loading} 
            onCancel={onCancel} 
          />
        </div>
      </div>
    </form>
  );
}