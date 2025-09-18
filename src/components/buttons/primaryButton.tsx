//วิธีใช้ เลือกสี bg ปุ่มได้เฉพาะใน bgColorMap และ textColor ได้เฉพาะใน textColorMap ถ้าอยากใช้สีอื่นต้อมาเพิ่มในนี้ก่อน
{/*   ตัวอย่างใช้ button
      <PrimaryButton 
      text="facebook" 
      srcImage="/icons/fbIcon.svg" 
      bgColor = "gray"
      textColor = "black"
      className="px-16"   
      //สามารถเพิ่มเขียน override className ได้ เช่น เเก้ความยาวปุ่มด้วย px
      /> */}

const bgColorMap = {
  primary: "bg-orange-5",
  secondary: "bg-orange-1",
  gray: "bg-gray-1",
  ghost: "bg-transparent",
} as const;

const textColorMap = {
  white: "text-white",
  black: "text-black",
  orange: "text-orange-5",
} as const;


type ButtonProps = {
  text?: string;
  srcImage?: string;
  bgColor?: keyof typeof bgColorMap;
  textColor?: keyof typeof textColorMap;
  className?: string;
};

export default function PrimaryButton({
  bgColor = "gray",
  text,
  textColor = "white",
  srcImage,
  className = "",

}: ButtonProps) {
  return (
    <button
      className={`${bgColorMap[bgColor]} ${textColorMap[textColor]} h-12 px-10 rounded-full flex items-center text-base font-bold hover:cursor-pointer active:scale-95 transition ${className}`}
    >
      {srcImage && (
        <img
          src={srcImage}
          alt="icon"
          className="inline-block mr-2 w-6 h-6"
        />
      )}
      {text}
    </button>
  );
}
