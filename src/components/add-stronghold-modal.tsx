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
import { createStronghold } from "@/lib/actions"
import { Stronghold, StrongholdBase } from "@/lib/types"
import { Loader2 } from "lucide-react"

interface AddStrongholdModalProps {
  isOpen: boolean
  onClose: () => void
  onStrongholdCreated?: () => void
  strongholds: Stronghold[]
}

export function AddStrongholdModal({ isOpen, onClose, onStrongholdCreated, strongholds }: AddStrongholdModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Extract unique warzones from strongholds
  const warzones = strongholds.map(stronghold => stronghold.warzone)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      const warzone = Number.parseInt(formData.get("warzone") as string)
      const coordinate_x = Number.parseInt(formData.get("coordinate_x") as string)
      const coordinate_y = Number.parseInt(formData.get("coordinate_y") as string)
      const duration_days = Number.parseInt(formData.get("duration_days") as string) || 0
      const duration_hours = Number.parseInt(formData.get("duration_hours") as string) || 0
      const duration_minutes = Number.parseInt(formData.get("duration_minutes") as string) || 0
      const duration_seconds = Number.parseInt(formData.get("duration_seconds") as string) || 0
      const level = formData.get("level") ? Number.parseInt(formData.get("level") as string) : undefined
      const alliance_name = formData.get("alliance_name") as string || undefined

      if (isNaN(warzone) || isNaN(coordinate_x) || isNaN(coordinate_y)) {
        throw new Error("Invalid input: Warzone and coordinates must be valid integers")
      }

      if (level === undefined || (isNaN(level) || level < 1 || level > 10)) {
        throw new Error("Invalid input: Level must be between 1 and 10")
      }

      const stronghold: StrongholdBase = {
        warzone,
        coordinate_x,
        coordinate_y,
        duration_days,
        duration_hours,
        duration_minutes,
        duration_seconds,
        level,
        alliance_name,
      }

      await createStronghold(stronghold)
      // Reset form
      const form = document.getElementById("add-sh-modal-form") as HTMLFormElement
      form?.reset()
      // Notify parent component to refresh strongholds
      onStrongholdCreated?.()
      // Close modal
      onClose()
    } catch (error) {
      console.error("Error creating stronghold:", error)
      alert("Failed to create stronghold. Please try again.")
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

        <form id="add-sh-modal-form" action={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="level">Level</Label>
              <Input
                id="level"
                name="level"
                type="number"
                min="1"
                max="10"
                placeholder="1-10"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="alliance_name">Alliance Name (Optional)</Label>
              <Input
                id="alliance_name"
                name="alliance_name"
                type="text"
                placeholder="e.g., MyAlliance"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <Label className="text-base font-medium">Time until reset</Label>
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