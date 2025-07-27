import { Redis } from '@upstash/redis'
import { Stronghold, StrongholdBase } from './types'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Redis key constants
const LIST_KEY = 'events'
const DATA_PREFIX = 'event'

export async function getAllStrongholds(): Promise<Stronghold[]> {
  try {
    const strongholdIds = await redis.zrange(LIST_KEY, 0, -1) as string[]
    if (strongholdIds.length === 0) {
      return []
    }

    const strongholds = await Promise.all(
      strongholdIds.map(async (id: string) => {
        const strongholdData = await redis.hgetall(`${DATA_PREFIX}:${id}`)
        return strongholdData as unknown as Stronghold
      })
    )

    // Sort by ready_at timestamp
    return strongholds.sort((a: Stronghold, b: Stronghold) => new Date(a.ready_at).getTime() - new Date(b.ready_at).getTime())
  } catch (error) {
    console.error('Failed to get all strongholds:', error)
    return []
  }
}

export async function addStronghold(stronghold: StrongholdBase): Promise<Stronghold> {
  try {
    const now = new Date()
    const readyAt = new Date(now)

    // Calculate ready time
    readyAt.setDate(readyAt.getDate() + stronghold.duration_days)
    readyAt.setHours(readyAt.getHours() + stronghold.duration_hours)
    readyAt.setMinutes(readyAt.getMinutes() + stronghold.duration_minutes)
    readyAt.setSeconds(readyAt.getSeconds() + stronghold.duration_seconds)

    // Generate composite key from warzone and coordinates
    const strongholdId = `${stronghold.warzone}:${stronghold.coordinate_x}:${stronghold.coordinate_y}`

    const newStronghold: Stronghold = {
      id: strongholdId,
      warzone: stronghold.warzone,
      coordinate_x: stronghold.coordinate_x,
      coordinate_y: stronghold.coordinate_y,
      duration_days: stronghold.duration_days,
      duration_hours: stronghold.duration_hours,
      duration_minutes: stronghold.duration_minutes,
      duration_seconds: stronghold.duration_seconds,
      level: stronghold.level,
      alliance_name: stronghold.alliance_name,
      created_at: now.toISOString(),
      ready_at: readyAt.toISOString(),
    }

    // Store stronghold data in hash
    await redis.hset(`${DATA_PREFIX}:${strongholdId}`, newStronghold as unknown as Record<string, unknown>)

    // Add to sorted set for ordering by ready_at
    await redis.zadd(LIST_KEY, {
      score: readyAt.getTime(),
      member: strongholdId
    })

    return newStronghold
  } catch (error) {
    console.error('Failed to add stronghold:', error)
    throw error
  }
}

export async function deleteStronghold(id: string): Promise<boolean> {
  try {
    // Remove from sorted set and remove data
    const removedFromSet = await redis.zrem(LIST_KEY, id)
    const removedData = await redis.del(`${DATA_PREFIX}:${id}`)

    return removedFromSet > 0 || removedData > 0
  } catch (error) {
    console.error('Failed to delete stronghold:', error)
    return false
  }
}

export async function updateStrongholdDuration(
  id: string,
  duration_days: number,
  duration_hours: number,
  duration_minutes: number,
  duration_seconds: number
): Promise<boolean> {
  try {
    const strongholdData = await redis.hgetall(`${DATA_PREFIX}:${id}`) as unknown as Stronghold
    if (!strongholdData) {
      return false
    }

    // Calculate new ready_at time based on created_at and new duration
    const createdAt = new Date() //new Date(eventData.created_at)
    const newReadyAt = new Date(createdAt)

    // Add the new duration to the created_at time
    newReadyAt.setDate(newReadyAt.getDate() + duration_days)
    newReadyAt.setHours(newReadyAt.getHours() + duration_hours)
    newReadyAt.setMinutes(newReadyAt.getMinutes() + duration_minutes)
    newReadyAt.setSeconds(newReadyAt.getSeconds() + duration_seconds)

    // Update stronghold with new duration and ready_at
    const updatedStronghold: Stronghold = {
      ...strongholdData,
      duration_days,
      duration_hours,
      duration_minutes,
      duration_seconds,
      ready_at: newReadyAt.toISOString(),
    }

    await redis.hset(`${DATA_PREFIX}:${id}`, updatedStronghold as unknown as Record<string, unknown>)

    // Update sorted set with new ready_at timestamp
    await redis.zadd(LIST_KEY, {
      score: newReadyAt.getTime(),
      member: id
    })

    return true
  } catch (error) {
    console.error('Failed to update stronghold duration:', error)
    return false
  }
}

export async function resetStrongholdTimer(id: string): Promise<boolean> {
  try {
    // Update the stronghold duration by 36 hours (1 day and 12 hours)
    return await updateStrongholdDuration(id, 1, 12, 0, 0)
  } catch (error) {
    console.error('Failed to reset stronghold:', error)
    return false
  }
}

export async function updateStronghold(
  id: string,
  alliance_name?: string,
  level?: number
): Promise<boolean> {
  try {
    const strongholdData = await redis.hgetall(`${DATA_PREFIX}:${id}`) as unknown as Stronghold
    if (!strongholdData) {
      return false
    }

    // Level is not allowed to be updated
    if (strongholdData.level) {
      level = strongholdData.level
    }

    const updatedStronghold: Stronghold = {
      ...strongholdData,
      alliance_name,
      level,
    }

    await redis.hset(`${DATA_PREFIX}:${id}`, updatedStronghold as unknown as Record<string, unknown>)

    return true
  } catch (error) {
    console.error('Failed to update stronghold details:', error)
    return false
  }
}


export default redis
