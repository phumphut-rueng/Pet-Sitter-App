import Image from "next/image";
import { Rating, Tag, IconLocation } from "./PetSitterCard";
import PrimaryButton from "../buttons/PrimaryButton";

export default function PetSitterProfileCard({
  title,
  hostName,
  experience,
  location,
  rating,
  tags,
  avatarUrl,
}: {
  title: string;
  hostName: string;
  experience: string;
  location: string;
  rating: number;
  tags: string[];
  avatarUrl: string;
}) {
  return (
    <div className="rounded-2xl shadow-xl p-6 bg-white w-full max-w-[416px] min-h-[500px] flex flex-col justify-between">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-40 h-40 rounded-full overflow-hidden relative">
          <Image
            src={avatarUrl}
            alt={hostName}
            fill
            className="object-cover"
          />
        </div>
        <h2 className="text-4xl font-bold mt-2">{title}</h2>
        <p className="font-bold text-xl">
          {hostName} <span className="text-success font-medium text-base">{experience} Exp.</span>
        </p>
        <Rating value={rating} size="md" />
        <div className="flex items-center justify-center gap-1 text-muted-text mt-2">
          <IconLocation />
          <span>{location}</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-1.5">
          {tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      </div>

    <div className="flex gap-2 pt-4 border-t mt-4 border-gray-2 -mx-6 px-6">
  <PrimaryButton
    text="Send Message"
    bgColor="secondary"
    textColor="orange"
    className="flex-1 min-w-0 whitespace-nowrap"
  />
  <PrimaryButton
    text="Book Now"
    bgColor="primary"
    textColor="white"
    className="flex-1 min-w-0 whitespace-nowrap"
  />
</div>
    </div>
  );
}
