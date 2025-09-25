import RatingSelect from '../ratingStar';

interface RatingFilterProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  className?: string;
  label?: string;
  layout?: 'horizontal' | 'vertical';
}

export function RatingFilter({ 
  rating, 
  onRatingChange, 
  className = '', 
  label,
  layout = 'horizontal' 
}: RatingFilterProps) {
  const layoutClasses = {
    horizontal: 'flex flex-wrap gap-2',
    vertical: 'flex flex-col gap-2'
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-semibold text-gray-7 mb-2 block">
          {label}
        </label>
      )}
      <div className={layoutClasses[layout]}>
        {[5, 4, 3, 2, 1].map((value) => (
          <RatingSelect
            key={value}
            value={value}
            selectRating={rating}
            onChange={onRatingChange}
            className="w-fit"
            classNameStar="w-4"
          />
        ))}
      </div>
    </div>
  );
}
