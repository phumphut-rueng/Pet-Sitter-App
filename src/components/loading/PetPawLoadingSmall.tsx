import React from 'react';

interface PetPawLoadingSmallProps {
  message?: string;
}

export function PetPawLoadingSmall({ 
  message = "Loading" 
}: PetPawLoadingSmallProps) {
  return (
    <div className="text-center">
      <div className="relative mb-4">
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Custom small loading animation */}
            <div className="w-16 h-16 bg-orange-4 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
            {/* Small paw pads */}
            <div 
              className="absolute -top-1 -left-1 w-4 h-4 bg-orange-3 rounded-full animate-bounce" 
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div 
              className="absolute -top-1 -right-1 w-4 h-4 bg-orange-3 rounded-full animate-bounce" 
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div 
              className="absolute -bottom-1 left-0.5 w-4 h-4 bg-orange-3 rounded-full animate-bounce" 
              style={{ animationDelay: '0.3s' }}
            ></div>
            <div 
              className="absolute -bottom-1 right-0.5 w-4 h-4 bg-orange-3 rounded-full animate-bounce" 
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Loading text with animation */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 animate-pulse">
          {message}
        </h3>
        <div className="flex items-center justify-center space-x-1">
          <div 
            className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" 
            style={{ animationDelay: '0s' }}
          ></div>
          <div 
            className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" 
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div 
            className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" 
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
