import React from 'react';

interface SocketLoadingProps {
  message?: string;
}

const SocketLoading: React.FC<SocketLoadingProps> = ({ 
  message = "Connecting to chat system..." 
}) => {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-10 max-w-lg mx-4 text-center transform animate-fade-in">
        {/* Animated Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Outer ring */}
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
            {/* Inner ring */}
            <div className="absolute top-2 left-2 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Main Title */}
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Connecting to PetSitter
        </h2>
        
        {/* Subtitle */}
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Initializing Chat System
        </h3>
        
        {/* Loading Message */}
        <p className="text-gray-600 mb-8 text-sm leading-relaxed">
          {message}
        </p>
        
        {/* Animated Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 h-3 rounded-full animate-progress-bar"></div>
        </div>
        
        {/* Status Text */}
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Please wait while we set up your connection...</span>
        </div>
        
        {/* Additional Info */}
        <div className="mt-6 text-xs text-gray-400">
          This usually takes just a few seconds
        </div>
      </div>
      
      {/* Floating Particles Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-300 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-purple-300 rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};

export default SocketLoading;
