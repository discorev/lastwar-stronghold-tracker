"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Edit3 } from "lucide-react"
import { resetStrongholdTimerAction } from "@/lib/actions"
import { EditDurationModal } from "@/components/edit-duration-modal"
import { EditStrongholdDetailsModal } from "@/components/edit-stronghold-details-modal"
import { Countdown } from "@/components/countdown"
import { Stronghold } from "@/lib/types"

interface StrongholdDetailProps {
  stronghold: Stronghold
  useServerTime: boolean
  onStrongholdDeleted?: () => void
  onStrongholdReset?: () => void
}

export function StrongholdDetail({ stronghold, useServerTime, onStrongholdDeleted, onStrongholdReset }: StrongholdDetailProps) {
  const [isReady, setIsReady] = useState(false)
  const [isWarning, setIsWarning] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isEditDetailsModalOpen, setIsEditDetailsModalOpen] = useState(false)

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)

    if (useServerTime) {
      // Convert to UTC-2 (server time)
      const utcMinus2 = new Date(date.getTime() - 2 * 60 * 60 * 1000)
      return (
        utcMinus2.toLocaleString("en-GB", {
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
      return date.toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    }
  }

  const handleReset = async () => {
    if (isResetting) return // Prevent multiple clicks

    setIsResetting(true)
    try {
      // Call the reset action
      await resetStrongholdTimerAction(stronghold.id)

      // Reset local state immediately for better UX
      setIsReady(false)
      setIsWarning(false)

      // Notify parent component to refresh events
      onStrongholdReset?.()
    } catch (error) {
      console.error("Failed to reset stronghold:", error)
      alert("Failed to reset stronghold. Please try again.")
    } finally {
      setIsResetting(false)
    }
  }

  const handleDurationUpdated = () => {
    // Notify parent component to refresh events
    setIsReady(false)
    setIsWarning(false)
    onStrongholdReset?.()
  }

  const handleDetailsUpdated = () => {
    // Notify parent component to refresh events
    onStrongholdReset?.()
  }

  return (
    <>
      <Card className={`transition-colors ${isReady ? "border-green-500 bg-green-50" :
        isWarning ? "border-amber-500 bg-amber-50" : ""
        }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {stronghold.alliance_name && <>[{stronghold.alliance_name}]&nbsp;</>}
              {stronghold.level ? `lvl ${stronghold.level}` : ""} Stronghold
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => setIsEditDetailsModalOpen(true)}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              Coordinates: WZ {stronghold.warzone} ({stronghold.coordinate_x}, {stronghold.coordinate_y})
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Duration: {stronghold.duration_days}d {stronghold.duration_hours}h {stronghold.duration_minutes}m {stronghold.duration_seconds}s
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

          <Countdown key={stronghold.ready_at} targetDate={new Date(stronghold.ready_at)} onReady={() => { setIsReady(true); setIsWarning(false) }} onWarning={() => setIsWarning(true)} onReset={handleReset} />

          <div className="text-sm text-center text-muted-foreground">
            <div>Ready at: {formatTimestamp(stronghold.ready_at)}</div>
            <div className="text-xs mt-1">Created: {formatTimestamp(stronghold.created_at)}</div>
          </div>
        </CardContent>
      </Card>

      <EditDurationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onDurationUpdated={handleDurationUpdated}
        stronghold={stronghold}
      />

      <EditStrongholdDetailsModal
        isOpen={isEditDetailsModalOpen}
        onClose={() => setIsEditDetailsModalOpen(false)}
        onDetailsUpdated={handleDetailsUpdated}
        onStrongholdDeleted={onStrongholdDeleted}
        stronghold={stronghold}
      />
    </>
  )
}
