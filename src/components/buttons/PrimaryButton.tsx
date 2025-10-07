import Image from "next/image";
//วิธีใช้ เลือกสี bg ปุ่มได้เฉพาะใน bgColorMap และ textColor ได้เฉพาะใน textColorMap ถ้าอยากใช้สีอื่นต้อมาเพิ่มในนี้ก่อน
{/*   ตัวอย่างใช้ button
      <PrimaryButton 
      text="facebook" 
      srcImage="/icons/fbIcon.svg" 
      bgColor = "gray"
      textColor = "black"
      className="px-16"   
      //สามารถเพิ่มเขียน override className ได้ เช่น เเก้ความยาวปุ่มด้วย px
      onClick={() => ("")}
      /> */}

const bgColorMap = {
  primary: "bg-orange-5 hover:bg-orange-6",
  secondary: "bg-orange-1 hover:bg-orange-2",
  gray: "bg-gray-1 hover:bg-gray-2",
  ghost: "bg-transparent",
} as const;

const textColorMap = {
  white: "text-white",
  black: "text-black",
  orange: "text-orange-5",
  gray: "text-gray-6",
} as const;


type ButtonProps = {
  text?: string;
  srcImage?: string;
  bgColor?: keyof typeof bgColorMap;
  textColor?: keyof typeof textColorMap;
  className?: string;
  onClick?: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function PrimaryButton({
  bgColor = "gray",
  text,
  textColor = "white",
  srcImage,
  className = "",
  onClick,
  ...props

}: ButtonProps) {
  return (
    <button
      {...props}
      className={`${bgColorMap[bgColor]} ${textColorMap[textColor]} h-12 px-10 rounded-full flex items-center text-base font-bold justify-center
      hover:cursor-pointer 
      active:scale-95 transition 
      disabled:opacity-50
      disabled:cursor-not-allowed 
      disabled:bg-gray-2 
      disabled:text-gray-6
      ${className}`}
      onClick={onClick}
    >
      {srcImage && (
        <Image
          src={srcImage}
          alt="icon"
          width={24}
          height={24}
          className="inline-block mr-2 w-6 h-6"
        />
      )}
      {text}
    </button>
  );
}
