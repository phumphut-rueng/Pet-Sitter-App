import * as React from "react";
import { Control } from "react-hook-form";
import type { OwnerProfileInput } from "@/lib/validators/profile";
import InputText from "@/components/input/InputText";
import { FormField } from "./FormField";
import { formatIdNumber } from "../utils/id";
import { FORM_CONFIG, getInputVariant } from "../utils/config";

/**

 * - ใช้ field.name แทนการใส่ name="idNumber" ซ้ำ เพื่อไม่ให้ชนกับ RHF
 * - กัน input ไม่ให้มี non-digit ตั้งแต่ onChange / onPaste / onKeyDown
 * - ถ้า formatIdNumber มี dash/space ให้คงไว้; ถ้าอยากให้เก็บแต่ดิบ ๆ ก็เปลี่ยนเป็น digitsOnly ได้
 */

const MAX_LEN = 13; // เปลี่ยนได้

export const IdNumberField: React.FC<{ control: Control<OwnerProfileInput> }> = ({ control }) => {
  // ฟังก์ชันกรองให้เหลือเฉพาะตัวเลขก่อน format
  const digitsOnly = (s: string) => s.replace(/\D+/g, "").slice(0, MAX_LEN);

  return (
    <FormField control={control} name="idNumber">
      {(field, fieldState) => (
        <InputText
          {...FORM_CONFIG.fields.idNumber}
          name={field.name}
          placeholder={FORM_CONFIG.fields.idNumber.placeholder ?? ""}
          value={(field.value as string | undefined) ?? ""}
          inputMode="numeric"
          pattern="[0-9]*"
          // จำกัดความยาวคร่าว ๆ ที่ฝั่ง UI
          maxLength={MAX_LEN + 4} // กันเผื่อมีขีด เช่น x-xxxx-xxxxx-xx-x
          onChange={(e) => {
            const raw = e.currentTarget.value;
            const cleaned = digitsOnly(raw);
            field.onChange(formatIdNumber(cleaned));
          }}
          onBlur={(e) => {
            // normalize อีกรอบตอน blur (กันเว้นวรรค/สัญลักษณ์)
            const cleaned = digitsOnly(e.currentTarget.value);
            field.onChange(formatIdNumber(cleaned));
            field.onBlur();
          }}
          onPaste={(e) => {
            const txt = (e.clipboardData?.getData("text") ?? "").trim();
            if (!txt) return;
            e.preventDefault();
            const cleaned = digitsOnly(txt);
            field.onChange(formatIdNumber(cleaned));
          }}
          onKeyDown={(e) => {
            // อนุญาต control keys / navigation
            const allowed = [
              "Backspace",
              "Delete",
              "ArrowLeft",
              "ArrowRight",
              "Tab",
              "Home",
              "End",
            ];
            if (allowed.includes(e.key)) return;

            // อนุญาตเฉพาะตัวเลข
            if (!/^\d$/.test(e.key)) {
              e.preventDefault();
            }
          }}
          variant={getInputVariant(!!fieldState.error)}
          errorText={fieldState.error?.message ?? ""}
          aria-invalid={!!fieldState.error}
        />
      )}
    </FormField>
  );
};