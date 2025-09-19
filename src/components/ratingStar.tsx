
{/*   ตัวอย่างใช้ rating
      const [rating, setRating] = useState(0);
      <RatingSelect value={5} selectRating={rating} onChange={setRating} />
      <RatingSelect value={4} selectRating={rating} onChange={setRating} />
        selectRating ใช้เป็นตัวแปรที่เก็บค่า rating ที่ถูกเลือกเพื่อให้เวลากดแล้วสีปุ่มเปลี่ยน
        เก็บค่า rating ไว้ใน state
*/}
type RatingSelectProps = {
    value?: number;
    selectRating?: number;
    onChange?: (value: number) => void;
  };
export default function RatingSelect({ 
  value = 0,
  selectRating,
  onChange,
}: RatingSelectProps) {
  const handleClick = () => {
    if(!onChange) return;
    onChange(isSelected ? 0 : value);
  }
  const isSelected = selectRating === value;
    return (
      <button 
        type="button"
        onClick={handleClick}
        className={`group flex items-center h-9 gap-2 bg-background px-3 py-2 rounded-sm border ${
          isSelected ? "border-orange-5" : "border-border"
        } hover:border-orange-5 hover:cursor-pointer`}>
        <span
        className={`text-foreground text-base pt-0.3 ${
          isSelected ? "text-orange-5" : "group-hover:text-orange-5"
        }`}
      >
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
