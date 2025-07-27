"use server"

import { addStronghold, getAllStrongholds, deleteStronghold, resetStrongholdTimer, updateStrongholdDuration, updateStronghold } from "./database"
import { StrongholdBase } from "./types"
import { revalidatePath } from "next/cache"

export async function createStronghold(newStronghold: StrongholdBase) {
  try {
    await addStronghold(newStronghold)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error creating stronghold:", error)
    throw new Error("Failed to create stronghold")
  }
}

export async function removeStronghold(id: string) {
  try {
    const success = await deleteStronghold(id)
    if (success) {
      revalidatePath("/")
      return { success: true }
    } else {
      throw new Error("Stronghold not found")
    }
  } catch (error) {
    console.error("Error deleting stronghold:", error)
    throw new Error("Failed to delete stronghold")
  }
}

export async function getStrongholds() {
  try {
    return await getAllStrongholds()
  } catch (error) {
    console.error("Error fetching strongholds:", error)
    return []
  }
}

export async function resetStrongholdTimerAction(id: string) {
  try {
    const success = await resetStrongholdTimer(id)
    if (success) {
      revalidatePath("/")
      return { success: true }
    } else {
      throw new Error("Stronghold not found")
    }
  } catch (error) {
    console.error("Error resetting stronghold:", error)
    throw new Error("Failed to reset stronghold")
  }
}

export async function updateStrongholdDurationAction(
  id: string,
  duration_days: number,
  duration_hours: number,
  duration_minutes: number,
  duration_seconds: number
) {
  try {
    const success = await updateStrongholdDuration(id, duration_days, duration_hours, duration_minutes, duration_seconds)
    if (success) {
      revalidatePath("/")
      return { success: true }
    } else {
      throw new Error("Stronghold not found")
    }
  } catch (error) {
    console.error("Error updating stronghold duration:", error)
    throw new Error("Failed to update stronghold duration")
  }
}

export async function updateStrongholdAction(
  id: string,
  alliance_name?: string,
  level?: number
) {
  try {
    const success = await updateStronghold(id, alliance_name, level)
    if (success) {
      revalidatePath("/")
      return { success: true }
    } else {
      throw new Error("Stronghold not found")
    }
  } catch (error) {
    console.error("Error updating stronghold details:", error)
    throw new Error("Failed to update stronghold details")
  }
}
