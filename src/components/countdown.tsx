"use client"

import { useState, useEffect } from "react"

interface CountdownProps {
    targetDate: Date,
    onReady?: () => void,
    onWarning?: () => void,
    onReset?: () => void,
}

export function Countdown({ targetDate, onReady, onWarning, onReset }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<string>("")
    const [hasWarned, setHasWarned] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [isResetting, setIsResetting] = useState(false)
    const [isHovering, setIsHovering] = useState(false)

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date()
            const readyTime = targetDate
            // Calculate the time difference in seconds and round down to the nearest second
            const timeDiff = Math.floor((readyTime.getTime() - now.getTime()) / 1000) * 1000

            if (timeDiff <= 0) {
                if (isReady === false) {
                    setTimeLeft("Ready!")
                    setIsReady(true)
                    onReady?.()
                }
                return
            }

            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)

            // Check if less than 5 minutes remaining
            const totalRemaining = days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds
            if (hasWarned === false) {
                if (totalRemaining < 5 * 60 && totalRemaining > 0) {
                    setHasWarned(true)
                    onWarning?.()
                }
            }

            // Format time left based on remaining duration
            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
            } else if (minutes > 0) {
                setTimeLeft(`${minutes}m ${seconds}s`)
            } else {
                setTimeLeft(`${seconds}s`)
            }
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 1000)

        return () => clearInterval(interval)
    }, [targetDate])

    const handleReset = async () => {
        if (isResetting) return // Prevent multiple clicks

        setIsResetting(true)
        onReset?.()
    }

    return <div
        className={`text-2xl font-bold text-center p-4 rounded-lg transition-all duration-200 ${isReady ? "text-green-600 bg-green-100" :
            hasWarned ? "text-amber-600 bg-amber-100" :
                "text-blue-600 bg-blue-50"
            } ${isReady && isHovering ? "cursor-pointer bg-green-200 hover:bg-green-300" : ""
            }`}
        onMouseEnter={() => isReady && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={isReady ? handleReset : undefined}
    >
        {isReady && isHovering ? (
            <div className="flex items-center justify-center gap-2">
                {isResetting ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                        Resetting...
                    </>
                ) : (
                    "Click to Reset"
                )}
            </div>
        ) : (
            timeLeft
        )}
    </div>
}