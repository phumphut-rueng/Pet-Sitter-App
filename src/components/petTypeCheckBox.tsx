import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useState } from "react"
//เลือกใช้ว่าอยากได้ layoutยังไง (row,column)
// <PetTypeCheckBox layout="row" />

type PetTypeCheckBoxProps = {
    layout?: "row" | "column"
    onChange ?: (selected: string[]) => void         
  }
export default function PetTypeCheckBox({layout = "row", onChange }: PetTypeCheckBoxProps) {
  const petTypes: string[] = ["Dog", "Cat", "Bird", "Rabbit"]
  const [selected, setSelected] = useState<string[]>([]);

  const handleCheckboxChange = (petType: string) => {
    let updated: string[];
    if (selected.includes(petType)) {
      updated = selected.filter((type) => type !== petType);
    } else {
      updated = [...selected, petType];
    }
    setSelected(updated);

    if (onChange) onChange(updated);
  }

  return (
    <div className={`flex ${layout === "row" ? "flex-row gap-4" : "flex-col gap-3"}`}>
      <p className="font-bold text-sm text-gray-9">Pet Type:</p>
      <div className="flex row gap-3">
      {petTypes.map((petType) => (
        <div key={petType} className="flex items-center gap-1 mr-3">
          <Checkbox
            id={petType}
            checked={selected.includes(petType)}
            onCheckedChange={() => handleCheckboxChange(petType)}
            className="border border-border hover:cursor-pointer hover:border-orange-5"
          />
          <Label htmlFor={petType} className="hover:cursor-pointer text-gray-9">
            {petType}
          </Label>
        </div>
      ))}
      </div>
    </div>
  )
}
