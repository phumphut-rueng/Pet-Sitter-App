import Image from "next/image";
import { StarRating, TagList, LocationIcon } from "./PetSitterCard";
import PrimaryButton from "../buttons/PrimaryButton";
import Link from "next/link";
export default function PetSitterProfileCard({
  title,
  hostName,
  experience,
  location,
  rating,
  tags,
  avatarUrl,
  ownerId,
  sitterId,
}: {
  title: string;
  hostName: string;
  experience: string;
  location: string;
  rating: number;
  tags: string[];
  avatarUrl: string | null;
  ownerId: number;
  sitterId: number;
}) {
  const getInitial = (name: string) => {
    if (!name) return "?";
    return name[0].toUpperCase();
  };

  return (
    <div className="rounded-2xl shadow-xl p-6 bg-white w-full max-w-[416px] min-h-[500px] flex flex-col justify-between">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-40 h-40 rounded-full overflow-hidden relative flex items-center justify-center bg-gray-2">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={hostName}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-6xl text-white font-bold">
              {getInitial(hostName)}
            </span>
          )}
        </div>
        <h2 className="text-4xl font-bold mt-2">{title}</h2>
        <p className="flex items-baseline gap-2">
          <span className="text-[20px] font-bold">{hostName}</span>
          <span className="text-[16px] font-medium text-success">
            {experience} Exp.
          </span>
        </p>
        <StarRating value={rating} size="md" />
        <div className="flex items-center justify-center gap-1 text-muted-text mt-2">
          <LocationIcon />
          <span>{location}</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-1.5">
          {tags.map((tag) => (
            <TagList key={tag} tags={[tag]} />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t mt-4 border-gray-2 -mx-6 px-6">
        <Link
          href={`/messages/${ownerId}`}
          passHref
          className="flex-1 min-w-0 whitespace-nowrap"
        >
          <PrimaryButton
            text="Send Message"
            bgColor="secondary"
            textColor="orange"
            className="w-full"
          />
        </Link>

        <Link
          href={`/book-now/${sitterId}`}
          passHref
          className="flex-1 min-w-0 whitespace-nowrap"
        >
          <PrimaryButton
            text="Book Now"
            bgColor="primary"
            textColor="white"
            className="w-full"
          />
        </Link>
      </div>
    </div>
  );
}
