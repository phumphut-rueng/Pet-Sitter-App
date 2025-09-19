import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

//เลือกใช้ว่าอยากได้ layoutยังไง (row,column)
// <PetTypeCheckBox layout="row" />

type PetTypeCheckBoxProps = {
    layout?: "row" | "column"         
  }
export default function PetTypeCheckBox({layout = "row"}: PetTypeCheckBoxProps) {
  const petTypes: string[] = ["Dog", "Cat", "Bird", "Rabbit"]

  return (
    <div className={`flex ${layout === "row" ? "flex-row gap-4" : "flex-col gap-3"}`}>
      <p className="font-bold text-sm text-gray-9">Pet Type:</p>
      <div className="flex row gap-3">
      {petTypes.map((petType) => (
        <div key={petType} className="flex items-center gap-1 mr-3">
          <Checkbox
            id={petType}
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
