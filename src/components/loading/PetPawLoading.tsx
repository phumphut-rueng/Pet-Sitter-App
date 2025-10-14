import React from 'react';

interface PetPawLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  baseStyleCustum?: string
}

export function PetPawLoading({
  message = "Loading Pet Sitter Details",
  size = 'md',
  baseStyleCustum
}: PetPawLoadingProps) {
  const sizeClasses = {
    sm: {
      paw: 'w-12 h-12',
      center: 'w-6 h-6',
      pads: 'w-3 h-3',
      text: 'text-lg',
      dots: 'w-1.5 h-1.5'
    },
    md: {
      paw: 'w-16 h-16',
      center: 'w-8 h-8',
      pads: 'w-4 h-4',
      text: 'text-xl',
      dots: 'w-2 h-2'
    },
    lg: {
      paw: 'w-20 h-20',
      center: 'w-10 h-10',
      pads: 'w-5 h-5',
      text: 'text-2xl',
      dots: 'w-2.5 h-2.5'
    }
  };

  const classes = sizeClasses[size];
  const baseStyle = "min-h-screen bg-gray-5 flex items-center justify-center";

  return (
    <div className={baseStyleCustum || baseStyle}>
      <div className="text-center">
        {/* Animated Pet Paw Loading */}
        <div className="relative mb-8">
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Main paw */}
              <div className={`${classes.paw} bg-orange-4 rounded-full flex items-center justify-center animate-pulse`}>
                <div className={`${classes.center} bg-white rounded-full`}></div>
              </div>
              {/* Paw pads */}
              <div
                className={`absolute -top-2 -left-2 ${classes.pads} bg-orange-300 rounded-full animate-bounce`}
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className={`absolute -top-2 -right-2 ${classes.pads} bg-orange-3 rounded-full animate-bounce`}
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className={`absolute -bottom-2 left-1 ${classes.pads} bg-orange-3 rounded-full animate-bounce`}
                style={{ animationDelay: '0.3s' }}
              ></div>
              <div
                className={`absolute -bottom-2 right-1 ${classes.pads} bg-orange-3 rounded-full animate-bounce`}
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Loading text with animation */}
        <div className="space-y-2">
          <h2 className={`${classes.text} font-semibold text-gray-8 animate-pulse`}>
            {message}
          </h2>
          <div className="flex items-center justify-center space-x-1">
            <div
              className={`${classes.dots} bg-orange-4 rounded-full animate-bounce`}
              style={{ animationDelay: '0s' }}
            ></div>
            <div
              className={`${classes.dots} bg-orange-4 rounded-full animate-bounce`}
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className={`${classes.dots} bg-orange-4 rounded-full animate-bounce`}
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
