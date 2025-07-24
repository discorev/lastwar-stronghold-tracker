"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"

interface TimezoneToggleProps {
  useServerTime: boolean
  onToggle: (useServerTime: boolean) => void
}

export function TimezoneToggle({ useServerTime, onToggle }: TimezoneToggleProps) {
  return (
    <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
      <Clock className="h-4 w-4" />
      <Label htmlFor="timezone-toggle" className="text-sm font-medium">
        Use Server Time (UTC-2)
      </Label>
      <Switch id="timezone-toggle" checked={useServerTime} onCheckedChange={onToggle} />
      <span className="text-xs text-muted-foreground">{useServerTime ? "Server Time" : "Local Time"}</span>
    </div>
  )
}
