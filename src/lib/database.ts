import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export interface Event {
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

export interface NewEvent {
  warzone: number
  coordinate_x: number
  coordinate_y: number
  duration_days: number
  duration_hours: number
  duration_minutes: number
  duration_seconds: number
}

// Redis key constants
const EVENTS_KEY = 'events'

export async function getAllEvents(): Promise<Event[]> {
  try {
    const eventIds = await redis.zrange(EVENTS_KEY, 0, -1) as string[]
    if (eventIds.length === 0) {
      return []
    }

    const events = await Promise.all(
      eventIds.map(async (id: string) => {
        const eventData = await redis.hgetall(`event:${id}`)
        return eventData as unknown as Event
      })
    )

    // Sort by ready_at timestamp
    return events.sort((a: Event, b: Event) => new Date(a.ready_at).getTime() - new Date(b.ready_at).getTime())
  } catch (error) {
    console.error('Failed to get all events:', error)
    return []
  }
}

export async function addEvent(event: NewEvent): Promise<Event> {
  try {
    const now = new Date()
    const readyAt = new Date(now)

    // Calculate ready time
    readyAt.setDate(readyAt.getDate() + event.duration_days)
    readyAt.setHours(readyAt.getHours() + event.duration_hours)
    readyAt.setMinutes(readyAt.getMinutes() + event.duration_minutes)
    readyAt.setSeconds(readyAt.getSeconds() + event.duration_seconds)

    // Generate composite key from warzone and coordinates
    const eventId = `${event.warzone}:${event.coordinate_x}:${event.coordinate_y}`

    const newEvent: Event = {
      id: eventId,
      warzone: event.warzone,
      coordinate_x: event.coordinate_x,
      coordinate_y: event.coordinate_y,
      duration_days: event.duration_days,
      duration_hours: event.duration_hours,
      duration_minutes: event.duration_minutes,
      duration_seconds: event.duration_seconds,
      created_at: now.toISOString(),
      ready_at: readyAt.toISOString(),
    }

    // Store event data in hash
    await redis.hset(`event:${eventId}`, newEvent as unknown as Record<string, unknown>)
    
    // Add to sorted set for ordering by ready_at
    await redis.zadd(EVENTS_KEY, {
      score: readyAt.getTime(),
      member: eventId
    })

    return newEvent
  } catch (error) {
    console.error('Failed to add event:', error)
    throw error
  }
}

export async function deleteEvent(id: string): Promise<boolean> {
  try {
    // Remove from sorted set
    const removedFromSet = await redis.zrem(EVENTS_KEY, id)
    
    // Remove event data
    const removedData = await redis.del(`event:${id}`)
    
    return removedFromSet > 0 || removedData > 0
  } catch (error) {
    console.error('Failed to delete event:', error)
    return false
  }
}



export default redis
