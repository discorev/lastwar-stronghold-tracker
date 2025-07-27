"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { updateStrongholdDurationAction } from "@/lib/actions"
import { Stronghold } from "@/lib/types"
import { Loader2 } from "lucide-react"

interface EditDurationModalProps {
  isOpen: boolean
  onClose: () => void
  onDurationUpdated?: () => void
  stronghold: Stronghold
}

export function EditDurationModal({ isOpen, onClose, onDurationUpdated, stronghold }: EditDurationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [durationDays, setDurationDays] = useState("0")
  const [durationHours, setDurationHours] = useState("0")
  const [durationMinutes, setDurationMinutes] = useState("0")
  const [durationSeconds, setDurationSeconds] = useState("0")

  // Calculate remaining duration when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date()
      const readyTime = new Date(stronghold.ready_at)
      const timeDiff = Math.floor((readyTime.getTime() - now.getTime()) / 1000) * 1000

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)

        setDurationDays(days.toString())
        setDurationHours(hours.toString())
        setDurationMinutes(minutes.toString())
        setDurationSeconds(seconds.toString())
      } else {
        // If already ready, set to 0
        setDurationDays("0")
        setDurationHours("0")
        setDurationMinutes("0")
        setDurationSeconds("0")
      }
    }
  }, [isOpen, stronghold.ready_at])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateStrongholdDurationAction(
        stronghold.id,
        parseInt(durationDays) || 0,
        parseInt(durationHours) || 0,
        parseInt(durationMinutes) || 0,
        parseInt(durationSeconds) || 0
      )

      // Notify parent component to refresh strongholds
      onDurationUpdated?.()
      // Close modal
      onClose()
    } catch (error) {
      console.error("Error updating stronghold duration:", error)
      alert("Failed to update stronghold duration. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Duration
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Warzone #{stronghold.warzone} - Coordinates: ({stronghold.coordinate_x}, {stronghold.coordinate_y})</p>
            {(stronghold.level || stronghold.alliance_name) && (
              <p className="mt-1">
                {stronghold.level && <span className="font-medium">Level {stronghold.level}</span>}
                {stronghold.level && stronghold.alliance_name && <span className="mx-2">•</span>}
                {stronghold.alliance_name && <span className="font-medium">{stronghold.alliance_name}</span>}
              </p>
            )}
          </div>

          <div>
            <Label className="text-base font-medium">Remaining Duration</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <div>
                <Label htmlFor="duration_days" className="text-sm">
                  Days
                </Label>
                <Input
                  id="duration_days"
                  type="number"
                  min="0"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  placeholder="0"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="duration_hours" className="text-sm">
                  Hours
                </Label>
                <Input
                  id="duration_hours"
                  type="number"
                  min="0"
                  max="23"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  placeholder="0"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="duration_minutes" className="text-sm">
                  Minutes
                </Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="0"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="duration_seconds" className="text-sm">
                  Seconds
                </Label>
                <Input
                  id="duration_seconds"
                  type="number"
                  min="0"
                  max="59"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(e.target.value)}
                  placeholder="0"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Duration"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 