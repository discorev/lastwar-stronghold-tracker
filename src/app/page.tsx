"use client"

import { useState, useEffect } from "react"
import { StrongholdDetail } from "@/components/stronghold-detail"
import { AddStrongholdModal } from "@/components/add-stronghold-modal"
import { FloatingActionButton } from "@/components/floating-action-button"
import { TimezoneToggle } from "@/components/timezone-toggle"
import { getStrongholds } from "@/lib/actions"
import { Stronghold } from "@/lib/types"
import { Calendar, Target } from "lucide-react"

export default function HomePage() {
  const [strongholds, setStrongholds] = useState<Stronghold[]>([])
  const [useServerTime, setUseServerTime] = useState(true)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchStrongholds = async () => {
    try {
      const fetchedStrongholds = await getStrongholds()
      setStrongholds(fetchedStrongholds)
    } catch (error) {
      console.error("Error fetching strongholds:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStrongholds()

    // Refresh strongholds every 30 seconds
    const interval = setInterval(fetchStrongholds, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleStrongholdCreated = () => {
    // Refresh strongholds immediately after a new stronghold is created
    fetchStrongholds()
  }

  const handleStrongholdReset = () => {
    // Refresh strongholds after a reset or duration update
    fetchStrongholds()
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
              Tracked Strongholds ({strongholds.length})
            </h2>

            {strongholds.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No strongholds tracked yet</p>
                <p className="text-sm">Add your first stronghold to get started</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {strongholds.map((stronghold) => (
                  <StrongholdDetail
                    key={stronghold.id}
                    stronghold={stronghold}
                    useServerTime={useServerTime}
                    onStrongholdDeleted={fetchStrongholds}
                    onStrongholdReset={handleStrongholdReset}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <FloatingActionButton onClick={openModal} />

        <AddStrongholdModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onStrongholdCreated={handleStrongholdCreated}
          strongholds={strongholds}
        />
      </div>
    </div>
  )
}
