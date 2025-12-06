"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"

export function FloatingAudioButton() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio on mount
    audioRef.current = new Audio("/assets/audio/audio.mp3")
    audioRef.current.addEventListener("ended", () => {
      setIsPlaying(false)
    })

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const handleClick = () => {
    // Trigger animation
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        setIsPlaying(false)
      } else {
        audioRef.current.play().catch((e) => {
          console.log("Audio playback failed:", e)
        })
        setIsPlaying(true)
      }
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`
        fixed bottom-6 right-6 z-50
        w-16 h-16 rounded-full
        shadow-[0_4px_20px_rgba(0,0,0,0.3)]
        hover:shadow-[0_6px_30px_rgba(0,0,0,0.4)]
        hover:scale-110
        active:scale-95
        transition-all duration-200 ease-out
        flex items-center justify-center
        overflow-hidden
        group
        ${isAnimating ? "animate-pulse scale-110" : ""}
        ${isPlaying ? "ring-4 ring-amber-300/50 ring-offset-2 ring-offset-background" : ""}
      `}
      aria-label={isPlaying ? "Stop audio" : "Play audio"}
    >
      {/* Ripple effect on hover */}
      <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Pulse animation when playing */}
      {isPlaying && (
        <>
          <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-30" />
          <span className="absolute inset-0 rounded-full bg-amber-500 animate-pulse opacity-20" />
        </>
      )}
      
      {/* Logo */}
      <div 
        className="relative z-10 transition-transform duration-200"
        style={isPlaying ? {
          animation: "breathe 1.2s ease-in-out infinite"
        } : undefined}
      >
        <Image
          src="/assets/images/cnb_logo.jpg"
          alt="CNB"
          width={64}
          height={64}
          className="rounded-full object-cover drop-shadow-md"
        />
      </div>

      {/* Expand/contract animation keyframes */}
      <style jsx>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }
      `}</style>
    </button>
  )
}

