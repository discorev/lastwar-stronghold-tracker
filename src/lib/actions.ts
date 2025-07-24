"use server"

import { addEvent, getAllEvents, deleteEvent, resetEvent, updateEventDuration, type NewEvent } from "./database"
import { revalidatePath } from "next/cache"

export async function createEvent(formData: FormData) {
  const warzone = Number.parseInt(formData.get("warzone") as string)
  const coordinate_x = Number.parseInt(formData.get("coordinate_x") as string)
  const coordinate_y = Number.parseInt(formData.get("coordinate_y") as string)
  const duration_days = Number.parseInt(formData.get("duration_days") as string) || 0
  const duration_hours = Number.parseInt(formData.get("duration_hours") as string) || 0
  const duration_minutes = Number.parseInt(formData.get("duration_minutes") as string) || 0
  const duration_seconds = Number.parseInt(formData.get("duration_seconds") as string) || 0

  if (isNaN(warzone) || isNaN(coordinate_x) || isNaN(coordinate_y)) {
    throw new Error("Invalid input: Warzone and coordinates must be valid integers")
  }

  const newEvent: NewEvent = {
    warzone,
    coordinate_x,
    coordinate_y,
    duration_days,
    duration_hours,
    duration_minutes,
    duration_seconds,
  }

  try {
    await addEvent(newEvent)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error creating event:", error)
    throw new Error("Failed to create event")
  }
}

export async function removeEvent(id: string) {
  try {
    const success = await deleteEvent(id)
    if (success) {
      revalidatePath("/")
      return { success: true }
    } else {
      throw new Error("Event not found")
    }
  } catch (error) {
    console.error("Error deleting event:", error)
    throw new Error("Failed to delete event")
  }
}

export async function getEvents() {
  try {
    return await getAllEvents()
  } catch (error) {
    console.error("Error fetching events:", error)
    return []
  }
}

export async function resetEventAction(id: string) {
  try {
    const success = await resetEvent(id)
    if (success) {
      revalidatePath("/")
      return { success: true }
    } else {
      throw new Error("Event not found")
    }
  } catch (error) {
    console.error("Error resetting event:", error)
    throw new Error("Failed to reset event")
  }
}

export async function updateEventDurationAction(
  id: string,
  duration_days: number,
  duration_hours: number,
  duration_minutes: number,
  duration_seconds: number
) {
  try {
    const success = await updateEventDuration(id, duration_days, duration_hours, duration_minutes, duration_seconds)
    if (success) {
      revalidatePath("/")
      return { success: true }
    } else {
      throw new Error("Event not found")
    }
  } catch (error) {
    console.error("Error updating event duration:", error)
    throw new Error("Failed to update event duration")
  }
}
