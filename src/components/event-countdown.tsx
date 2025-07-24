"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, MapPin, Clock } from "lucide-react"
import { removeEvent } from "@/lib/actions"

interface Event {
  id: string
  warzone: number
  coordinate_x: number
  coordinate_y: number
  duration_days: number
  duration_hours: number
  duration_minutes: number
  duration_seconds: number
  created_at: string
  ready_at: string
}

interface EventCountdownProps {
  event: Event
  useServerTime: boolean
  onEventDeleted?: () => void
}

export function EventCountdown({ event, useServerTime, onEventDeleted }: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [isReady, setIsReady] = useState(false)
  const [isWarning, setIsWarning] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const readyTime = new Date(event.ready_at)
      const timeDiff = readyTime.getTime() - now.getTime()

      if (timeDiff <= 0) {
        setTimeLeft("Ready!")
        setIsReady(true)
        setIsWarning(false)
        return
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)

      // Check if less than 5 minutes remaining
      const totalMinutes = days * 24 * 60 + hours * 60 + minutes
      setIsWarning(totalMinutes < 5 && totalMinutes > 0)

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
      setIsReady(false)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [event.ready_at])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)

    if (useServerTime) {
      // Convert to UTC-2 (server time)
      const utcMinus2 = new Date(date.getTime() - 2 * 60 * 60 * 1000)
      return (
        utcMinus2.toLocaleString("en-US", {
          timeZone: "UTC",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }) + " (UTC-2)"
      )
    } else {
      // Use local time
      return date.toLocaleString()
    }
  }

  const handleDelete = async () => {
    if (isDeleting) return // Prevent multiple clicks
    
    setIsDeleting(true)
    try {
      await removeEvent(event.id)
      // Notify parent component to refresh events
      onEventDeleted?.()
    } catch (error) {
      console.error("Failed to delete event:", error)
      alert("Failed to delete event. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className={`transition-colors ${
      isReady ? "border-green-500 bg-green-50" : 
      isWarning ? "border-amber-500 bg-amber-50" : ""
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            [Warzone #{event.warzone} X: {event.coordinate_x} Y: {event.coordinate_y}]
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            Coordinates: ({event.coordinate_x}, {event.coordinate_y})
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Duration: {event.duration_days}d {event.duration_hours}h {event.duration_minutes}m {event.duration_seconds}s
          </span>
        </div>

        <div
          className={`text-2xl font-bold text-center p-4 rounded-lg ${
            isReady ? "text-green-600 bg-green-100" : 
            isWarning ? "text-amber-600 bg-amber-100" : 
            "text-blue-600 bg-blue-50"
          }`}
        >
          {timeLeft}
        </div>

        <div className="text-sm text-center text-muted-foreground">
          <div>Ready at: {formatTimestamp(event.ready_at)}</div>
          <div className="text-xs mt-1">Created: {formatTimestamp(event.created_at)}</div>
        </div>
      </CardContent>
    </Card>
  )
}
