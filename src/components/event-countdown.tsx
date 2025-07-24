"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, MapPin, Clock, Edit3 } from "lucide-react"
import { removeEvent, resetEventAction } from "@/lib/actions"
import { EditDurationModal } from "@/components/edit-duration-modal"

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
  onEventReset?: () => void
}

export function EventCountdown({ event, useServerTime, onEventDeleted, onEventReset }: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [isReady, setIsReady] = useState(false)
  const [isWarning, setIsWarning] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const readyTime = new Date(event.ready_at)
      // Calculate the time difference in seconds and round down to the nearest second
      const timeDiff = Math.floor((readyTime.getTime() - now.getTime()) / 1000) * 1000

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
      const totalRemaining = days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds
      setIsWarning(totalRemaining < 5 * 60 && totalRemaining > 0)

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

  const handleReset = async () => {
    if (isResetting) return // Prevent multiple clicks
    
    setIsResetting(true)
    try {      
      // Call the reset action
      await resetEventAction(event.id)
      
      // Notify parent component to refresh events
      onEventReset?.()
    } catch (error) {
      console.error("Failed to reset event:", error)
      alert("Failed to reset event. Please try again.")
    } finally {
      setIsResetting(false)
    }
  }

  const handleDurationUpdated = () => {
    // Notify parent component to refresh events
    onEventReset?.()
  }

  return (
    <>
      <Card className={`transition-colors ${
        isReady ? "border-green-500 bg-green-50" : 
        isWarning ? "border-amber-500 bg-amber-50" : ""
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              [WZ #{event.warzone} X: {event.coordinate_x} Y: {event.coordinate_y}]
            </CardTitle>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Event</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this event? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    {isDeleting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Deleting...
                      </div>
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>

          <div
            className={`text-2xl font-bold text-center p-4 rounded-lg transition-all duration-200 ${
              isReady ? "text-green-600 bg-green-100" : 
              isWarning ? "text-amber-600 bg-amber-100" : 
              "text-blue-600 bg-blue-50"
            } ${
              isReady && isHovering ? "cursor-pointer bg-green-200 hover:bg-green-300" : ""
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

          <div className="text-sm text-center text-muted-foreground">
            <div>Ready at: {formatTimestamp(event.ready_at)}</div>
            <div className="text-xs mt-1">Created: {formatTimestamp(event.created_at)}</div>
          </div>
        </CardContent>
      </Card>

      <EditDurationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onDurationUpdated={handleDurationUpdated}
        event={event}
      />
    </>
  )
}
