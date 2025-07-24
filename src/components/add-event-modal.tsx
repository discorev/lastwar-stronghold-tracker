"use client"

import { useState } from "react"
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
import { WarzoneInput } from "@/components/warzone-input"
import { createEvent } from "@/lib/actions"
import { Loader2 } from "lucide-react"

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

interface AddEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated?: () => void
  events: Event[]
}

export function AddEventModal({ isOpen, onClose, onEventCreated, events }: AddEventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Extract unique warzones from events
  const warzones = events.map(event => event.warzone)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      await createEvent(formData)
      // Reset form
      const form = document.getElementById("add-event-modal-form") as HTMLFormElement
      form?.reset()
      // Notify parent component to refresh events
      onEventCreated?.()
      // Close modal
      onClose()
    } catch (error) {
      console.error("Error creating event:", error)
      alert("Failed to create event. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Add New Stronghold
          </DialogTitle>
        </DialogHeader>
        
        <form id="add-event-modal-form" action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <WarzoneInput 
              id="warzone" 
              name="warzone" 
              required 
              placeholder="e.g., 1" 
              disabled={isSubmitting}
              warzones={warzones}
            />
            <div>
              <Label htmlFor="coordinate_x">X Coordinate</Label>
              <Input id="coordinate_x" name="coordinate_x" type="number" required placeholder="e.g., 100" disabled={isSubmitting} />
            </div>
            <div>
              <Label htmlFor="coordinate_y">Y Coordinate</Label>
              <Input id="coordinate_y" name="coordinate_y" type="number" required placeholder="e.g., 200" disabled={isSubmitting} />
            </div>
          </div>

          <div>
            <Label className="text-base font-medium">Duration</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <div>
                <Label htmlFor="duration_days" className="text-sm">
                  Days
                </Label>
                <Input id="duration_days" name="duration_days" type="number" min="0" defaultValue="0" placeholder="0" disabled={isSubmitting} />
              </div>
              <div>
                <Label htmlFor="duration_hours" className="text-sm">
                  Hours
                </Label>
                <Input
                  id="duration_hours"
                  name="duration_hours"
                  type="number"
                  min="0"
                  max="23"
                  defaultValue="0"
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
                  name="duration_minutes"
                  type="number"
                  min="0"
                  max="59"
                  defaultValue="0"
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
                  name="duration_seconds"
                  type="number"
                  min="0"
                  max="59"
                  defaultValue="0"
                  placeholder="0"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Stronghold"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 