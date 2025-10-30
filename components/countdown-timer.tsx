"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  endDate: string
}

export function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date(endDate).getTime()
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true })
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isEnded: false,
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  if (timeLeft.isEnded) {
    return <div className="text-destructive font-semibold">Lelang Berakhir</div>
  }

  return (
    <div className="flex gap-2 text-sm">
      <div className="bg-primary/10 px-3 py-1 rounded">
        <span className="font-semibold text-primary">{timeLeft.days}</span>
        <span className="text-foreground-secondary ml-1">Hari</span>
      </div>
      <div className="bg-primary/10 px-3 py-1 rounded">
        <span className="font-semibold text-primary">{timeLeft.hours}</span>
        <span className="text-foreground-secondary ml-1">Jam</span>
      </div>
      <div className="bg-primary/10 px-3 py-1 rounded">
        <span className="font-semibold text-primary">{timeLeft.minutes}</span>
        <span className="text-foreground-secondary ml-1">Menit</span>
      </div>
      <div className="bg-primary/10 px-3 py-1 rounded">
        <span className="font-semibold text-primary">{timeLeft.seconds}</span>
        <span className="text-foreground-secondary ml-1">Detik</span>
      </div>
    </div>
  )
}
