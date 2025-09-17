import React from "react";

export type PetTypeKey = "dog" | "cat" | "bird" | "rabbit";

const LABEL: Record<PetTypeKey, string> = {
  dog: "Dog",
  cat: "Cat",
  bird: "Bird",
  rabbit: "Rabbit",
};

const TONE: Record<PetTypeKey, string> = {
  dog: "text-green bg-green-bg",
  cat: "text-pink bg-pink-bg",
  bird: "text-blue bg-blue-bg",
  rabbit: "text-orange bg-yellow-bg",
};

type Props = { typeKey: PetTypeKey; className?: string };

export function PetTypeBadge({ typeKey, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-4 py-1 text-base font-medium
                  border ${TONE[typeKey]} ${className}`}
    >
      {LABEL[typeKey]}
    </span>
  );
}
