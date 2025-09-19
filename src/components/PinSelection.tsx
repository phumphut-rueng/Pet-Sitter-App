import React, { useState } from 'react';

interface PinSelectionProps {
  className?: string;
  onSelect?: (isSelected: boolean) => void;
  defaultSelected?: boolean;
}

const PinSelection: React.FC<PinSelectionProps> = ({
  className = '',
  onSelect,
  defaultSelected = false
}) => {
  const [isSelected, setIsSelected] = useState<boolean>(defaultSelected);

  const handleClick = () => {
    const newSelected = !isSelected;
    setIsSelected(newSelected);
    onSelect?.(newSelected);
  };

  return (
    <button
      onClick={handleClick}
      className={`transition-all duration-200 hover:scale-105 active:scale-95 ${className} cursor-pointer`}
      style={{
        width: '72px',
        height: '84px',
        borderRadius: ' 60% 60% 40% 40% / 50% 50% 90% 90% '
      }}
      aria-label={isSelected ? 'Deselect pin' : 'Select pin'}
    >
      <div className="relative">
        {/* Pin TearDrop Shape */}
        <svg 
          width="72"  /*ปรับขนาดTeardrop ตามที่ต้องการ*/
          height="84" /*ปรับขนาดTeardrop ตามที่ต้องการ*/
          viewBox="0 0 76 88" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          <g filter="url(#filter0_d_62_485)">
            <path 
              d="M37 7.33334C29.2203 7.33334 21.7592 10.4238 16.2582 15.9249C10.7571 21.4259 7.66663 28.887 7.66663 36.6667C7.66663 56.4667 33.5166 78.8333 34.6166 79.7867C35.2808 80.3548 36.126 80.6669 37 80.6669C37.8739 80.6669 38.7191 80.3548 39.3833 79.7867C40.6666 78.8333 66.3333 56.4667 66.3333 36.6667C66.3333 28.887 63.2428 21.4259 57.7418 15.9249C52.2407 10.4238 44.7796 7.33334 37 7.33334Z" 
              fill={isSelected ? "var(--color-orange-6)" : "white"}
              stroke={isSelected ? "white" : "none"}
              strokeWidth="0.1"  /*ปรับความหนาของเborder Teardrop*/
            />
            <path 
              d="M36.9996 7.83334C44.6467 7.83334 51.981 10.8714 57.3883 16.2787C62.7954 21.6859 65.8335 29.0195 65.8336 36.6664C65.8336 46.3815 59.5185 56.8054 52.9498 64.9808C46.3964 73.1371 39.6904 78.9355 39.0856 79.3851L39.0709 79.3958L39.0582 79.4066C38.4846 79.8972 37.7544 80.1673 36.9996 80.1673C36.3393 80.1673 35.6979 79.9606 35.1637 79.5804L34.942 79.4066C34.3836 78.9227 27.6818 73.1207 21.1188 64.9808C14.5264 56.8044 8.16663 46.3805 8.16663 36.6664C8.16671 29.0194 11.2047 21.6859 16.6119 16.2787C22.0192 10.8714 29.3527 7.83343 36.9996 7.83334Z" 
              stroke={isSelected ? "white" : "none"}
              strokeWidth="1"
            />
          </g>
          <defs>
            <filter id="filter0_d_62_485" x="0.666626" y="0.333344" width="74.6666" height="89.3336" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dx="1" dy="1"/>
              <feGaussianBlur stdDeviation="4"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.24 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_62_485"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_62_485" result="shape"/>
            </filter>
          </defs>
        </svg>

        {/* Paw Print Inside */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translateY(-5px)' }}>
          <svg 
            width="30"    /*ปรับขนาดPaw ตามที่ต้องการ*/
            height="35"   /*ปรับขนาดPaw ตามที่ต้องการ*/
            viewBox="0 0 32 29" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_62_487)">
              <path 
                d="M4.7947 8.16472C4.81952 8.16135 4.84434 8.16626 4.86916 8.16656C4.35134 3.24822 7.51039 0.540768 10.6704 0.0718282C12.732 -0.234149 14.7285 0.475092 16 1.49184C17.2717 0.475092 19.2679 -0.234148 21.3296 0.0718291C24.4896 0.540769 27.6486 3.24822 27.1308 8.16687C27.1556 8.16656 27.1804 8.16165 27.2052 8.16503C29.0991 8.42282 31.9655 10.538 31.9994 13.9049C32.0493 18.8745 28.5204 20.4336 27.2273 22.994C24.9348 27.533 21.3439 29.0703 16.0546 28.9976L15.9451 28.9976C10.6558 29.0703 7.06485 27.533 4.77236 22.994C3.4792 20.4336 -0.049669 18.8745 0.000281072 13.9049C0.0341006 10.538 2.90088 8.42282 4.79439 8.16472L4.7947 8.16472Z" 
                fill={isSelected ? "white" : "var(--color-orange-5)"}
                stroke={isSelected ? "var(--color-orange-5)" : "white"}
                strokeWidth="0.5"
              />
              <path 
                d="M22.7053 17.3569C21.4268 16.1049 21.6383 13.843 23.1779 12.3046C24.7174 10.7663 27.0019 10.5341 28.2804 11.786C29.5589 13.038 29.3473 15.2999 27.8078 16.8383C26.2683 18.3766 23.9838 18.6088 22.7053 17.3569Z" 
                fill={isSelected ? "var(--color-orange-5)" : "white"}
                stroke={isSelected ? "var(--color-orange-5)" : "white"}
                strokeWidth="0.5"
              />
              <path 
                d="M19.0476 10.5672C17.3464 9.98842 16.5443 7.85987 17.256 5.81294C17.9678 3.766 19.9238 2.57582 21.625 3.15459C23.3262 3.73336 24.1284 5.86191 23.4166 7.90885C22.7049 9.95578 20.7488 11.146 19.0476 10.5672Z" 
                fill={isSelected ? "var(--color-orange-5)" : "white"}
                stroke={isSelected ? "var(--color-orange-5)" : "white"}
                strokeWidth="0.5"
              />
              <path 
                d="M4.19142 16.8417C2.6519 15.3034 2.44031 13.0414 3.71882 11.7895C4.99734 10.5375 7.28181 10.7697 8.82133 12.3081C10.3609 13.8464 10.5724 16.1084 9.29393 17.3603C8.01541 18.6122 5.73094 18.38 4.19142 16.8417Z" 
                fill={isSelected ? "var(--color-orange-5)" : "white"}
                stroke={isSelected ? "var(--color-orange-5)" : "white"}
                strokeWidth="0.5"
              />
              <path 
                d="M8.58428 7.9077C7.87255 5.86077 8.67468 3.73222 10.3759 3.15345C12.0771 2.57468 14.0332 3.76486 14.7449 5.81179C15.4566 7.85873 14.6545 9.98728 12.9533 10.5661C11.2521 11.1448 9.296 9.95464 8.58428 7.9077Z" 
                fill={isSelected ? "var(--color-orange-5)" : "white"}
                stroke={isSelected ? "var(--color-orange-5)" : "white"}
                strokeWidth="0.5"
              />
              <path 
                d="M9.38598 19.3358C9.9553 17.7752 11.0722 17.499 12.183 15.6469C12.8708 14.5 13.3207 11.3813 16.0004 11.369C18.6798 11.381 19.1299 14.5 19.8178 15.6469C20.9285 17.499 22.0454 17.7752 22.6148 19.3358C22.9275 20.1929 22.6632 20.955 22.306 21.5427C21.6896 22.5579 19.9416 23.1821 17.9869 22.5785C17.0242 22.2811 16.1257 22.2449 16.0004 22.2412C15.8747 22.2449 14.9762 22.2811 14.0138 22.5785C12.0592 23.1821 10.3115 22.5579 9.69469 21.5427C9.33758 20.9547 9.07324 20.1929 9.38598 19.3358Z" 
                fill={isSelected ? "var(--color-orange-5)" : "white"}
                stroke={isSelected ? "var(--color-orange-5)" : "white"}
                strokeWidth="0.5"
              />
            </g>
            <defs>
              <clipPath id="clip0_62_487">
                <rect width="32" height="29" fill="white" transform="matrix(-1 -8.74228e-08 -8.74228e-08 1 32 0)"/>
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
    </button>
  );
};

export default PinSelection;
