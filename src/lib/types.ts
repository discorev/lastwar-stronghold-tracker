export interface StrongholdBase {
    warzone: number
    coordinate_x: number
    coordinate_y: number
    duration_days: number
    duration_hours: number
    duration_minutes: number
    duration_seconds: number
    level?: number
    alliance_name?: string
}

export interface Stronghold extends StrongholdBase {
    id: string
    created_at: string
    ready_at: string
}