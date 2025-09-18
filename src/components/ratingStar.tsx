type RatingSelectProps = {
    value?: number;
  };
export default function RatingSelect({ value = 0 }: RatingSelectProps) {
    return (
      <button className="group flex items-center h-9 gap-2 bg-background px-3 py-2 rounded-lg border border-border hover:border-orange-5 hover:cursor-pointer">
        <span className="text-foreground text-base pt-0.3 group-hover:text-orange-5">
          {value}
        </span>
        {Array.from({ length: value }).map((_, i) => (
          <img
            key={i}
            src="/icons/Rating-Star.svg"
            alt="Star"
          />
        ))}
      </button>
    );
  }
