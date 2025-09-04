'use client';

import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
  className?: string;
}

export function LoadingSpinner({ 
  text = "Carregando...", 
  size = 'md', 
  variant = 'default',
  className = ""
}: LoadingSpinnerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const sizeClasses = {
    sm: {
      container: "min-h-[200px]",
      icon: "h-6 w-6",
      title: "text-lg",
      text: "text-sm",
      dots: "w-2 h-2",
      progress: "w-32 h-0.5"
    },
    md: {
      container: "min-h-screen",
      icon: "h-12 w-12",
      title: "text-3xl",
      text: "text-lg",
      dots: "w-3 h-3",
      progress: "w-64 h-1"
    },
    lg: {
      container: "min-h-screen",
      icon: "h-16 w-16",
      title: "text-4xl",
      text: "text-xl",
      dots: "w-4 h-4",
      progress: "w-80 h-1"
    }
  };

  const currentSize = sizeClasses[size];

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center ${currentSize.container} ${className}`}>
        <div className="text-center">
          <div className="flex justify-center space-x-2 mb-4">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`${currentSize.dots} bg-blue-600 rounded-full animate-pulse`}
                style={{
                  animationDelay: `${index * 200}ms`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
          {text && (
            <p className="text-muted-foreground">{text}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-background flex items-center justify-center ${currentSize.container} ${className}`}>
      <div className="text-center">
        {/* Logo Animation */}
        <div className={`flex items-center justify-center mb-8 transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <div className="mr-3 animate-spin">
            <BookOpen className={`${currentSize.icon} text-blue-600 animate-pulse`} />
          </div>
          <h1 className={`${currentSize.title} font-bold text-foreground transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}`}>
            Kreulich Blog
          </h1>
        </div>

        {/* Loading Text */}
        <p className={`text-muted-foreground ${currentSize.text} mb-8 transition-all duration-500 delay-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {text}
        </p>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`${currentSize.dots} bg-blue-600 rounded-full animate-pulse`}
              style={{
                animationDelay: `${index * 200}ms`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className={`mt-8 ${currentSize.progress} bg-muted rounded-full overflow-hidden mx-auto transition-all duration-500 delay-600 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse" />
        </div>

        {/* Subtle Background Animation */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50/20 via-purple-50/20 to-pink-50/20 animate-pulse" />
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        
        .animate-spin {
          animation: spin 2s linear infinite;
        }
        
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
