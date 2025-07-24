"use client"

import { useState, useEffect } from "react"
import { EventCountdown } from "@/components/event-countdown"
import { AddEventModal } from "@/components/add-event-modal"
import { FloatingActionButton } from "@/components/floating-action-button"
import { TimezoneToggle } from "@/components/timezone-toggle"
import { getEvents } from "@/lib/actions"
import { Calendar, Target } from "lucide-react"

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

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [useServerTime, setUseServerTime] = useState(true)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchEvents = async () => {
    try {
      const fetchedEvents = await getEvents()
      setEvents(fetchedEvents)
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()

    // Refresh events every 30 seconds
    const interval = setInterval(fetchEvents, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleEventCreated = () => {
    // Refresh events immediately after a new event is created
    fetchEvents()
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading strongholds...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <Target className="h-8 w-8" />
            Stronghold Tracker
          </h1>
          <p className="text-muted-foreground">Track stronghold reset times</p>
        </header>

        <div className="max-w-4xl mx-auto space-y-6">
          <TimezoneToggle useServerTime={useServerTime} onToggle={setUseServerTime} />

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Tracked Strongholds ({events.length})
            </h2>

            {events.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No strongholds tracked yet</p>
                <p className="text-sm">Add your first stronghold to get started</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCountdown 
                    key={event.id} 
                    event={event} 
                    useServerTime={useServerTime} 
                    onEventDeleted={handleEventCreated}
                    onEventReset={handleEventCreated}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <FloatingActionButton onClick={openModal} />
      <AddEventModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onEventCreated={handleEventCreated} 
        events={events}
      />
    </div>
  )
}
