"use client"

import { useState, useRef } from "react"

export function FloatingAudioButton() {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play().catch((e) => {
          console.log("Video playback failed:", e)
        })
        setIsPlaying(true)
      }
    }
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
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
        ${isPlaying ? "ring-4 ring-amber-300/50 ring-offset-2 ring-offset-background" : ""}
      `}
      aria-label={isPlaying ? "Pause video" : "Play video"}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src="/assets/videos/video.mp4"
        className="absolute inset-0 w-full h-full object-cover rounded-full"
        onEnded={handleVideoEnd}
        playsInline
        muted={false}
      />

      {/* Ripple effect on hover */}
      <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none" />
    </button>
  )
}
