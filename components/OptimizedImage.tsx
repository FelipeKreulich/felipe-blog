'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string | null | undefined
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  sizes?: string
  quality?: number
  fallbackSrc?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
}

const DEFAULT_FALLBACK = '/placeholder-image.png'

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  priority = false,
  sizes,
  quality = 85,
  fallbackSrc = DEFAULT_FALLBACK,
  objectFit = 'cover',
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    setImgSrc(fallbackSrc)
  }

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  // Se for fill mode
  if (fill) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        <Image
          src={imgSrc}
          alt={alt}
          fill
          sizes={sizes || '100vw'}
          priority={priority}
          quality={quality}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          style={{ objectFit }}
          onError={handleError}
          onLoad={handleLoadingComplete}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 animate-pulse" />
        )}
      </div>
    )
  }

  // Se for com width/height específicos
  return (
    <div className={cn('relative', className)}>
      <Image
        src={imgSrc}
        alt={alt}
        width={width || 800}
        height={height || 600}
        priority={priority}
        quality={quality}
        sizes={sizes}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onError={handleError}
        onLoad={handleLoadingComplete}
      />
      {isLoading && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 animate-pulse"
          style={{ width: width || 800, height: height || 600 }}
        />
      )}
    </div>
  )
}
