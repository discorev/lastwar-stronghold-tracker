"use client"

import { useState, useEffect } from "react"
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { updateStrongholdAction, removeStronghold } from "@/lib/actions"
import { Stronghold } from "@/lib/types"
import { Loader2, Trash2 } from "lucide-react"

interface EditStrongholdDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    onDetailsUpdated?: () => void
    onStrongholdDeleted?: () => void
    stronghold: Stronghold
}

export function EditStrongholdDetailsModal({ isOpen, onClose, onDetailsUpdated, onStrongholdDeleted, stronghold }: EditStrongholdDetailsModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [allianceName, setAllianceName] = useState("")
    const [level, setLevel] = useState("")

    const hasLevel = stronghold.level !== undefined

    // Initialize form when modal opens
    useEffect(() => {
        if (isOpen) {
            setAllianceName(stronghold.alliance_name || "")
            setLevel(stronghold.level?.toString() || "")
        }
    }, [isOpen, stronghold.alliance_name, stronghold.level])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const levelNumber = level ? parseInt(level) : undefined

            if (levelNumber !== undefined && (levelNumber < 1 || levelNumber > 10)) {
                alert("Level must be between 1 and 10")
                return
            }

            await updateStrongholdAction(
                stronghold.id,
                allianceName || undefined,
                levelNumber
            )

            // Notify parent component to refresh strongholds
            onDetailsUpdated?.()
            // Close modal
            onClose()
        } catch (error) {
            console.error("Error updating stronghold details:", error)
            alert("Failed to update stronghold details. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (isDeleting) return // Prevent multiple clicks

        setIsDeleting(true)
        try {
            await removeStronghold(stronghold.id)

            // Notify parent component to refresh strongholds
            onStrongholdDeleted?.()
            // Close modal
            onClose()
        } catch (error) {
            console.error("Error deleting stronghold:", error)
            alert("Failed to delete stronghold. Please try again.")
        } finally {
            setIsDeleting(false)
        }
    }

    const handleClose = () => {
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Edit Stronghold Details
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                        <p>Warzone #{stronghold.warzone} - Coordinates: ({stronghold.coordinate_x}, {stronghold.coordinate_y})</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {!hasLevel && <div>
                            <Label htmlFor="level">Level</Label>
                            <Input
                                id="level"
                                type="number"
                                min="1"
                                max="10"
                                placeholder="1-10"
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>}
                        <div>
                            <Label htmlFor="alliance_name">Alliance Name</Label>
                            <Input
                                id="alliance_name"
                                type="text"
                                placeholder="e.g., MyAlliance"
                                value={allianceName}
                                onChange={(e) => setAllianceName(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <DialogFooter className="grid grid-cols-3 justify-items">
                        <div className="justify-self-start">
                            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                                Cancel
                            </Button>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={isSubmitting || isDeleting}
                                >
                                    {isDeleting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Deleting...
                                        </div>
                                    ) : (
                                        <>
                                            <Trash2 />
                                            Delete
                                        </>
                                    )}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Stronghold</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this stronghold? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                        {isDeleting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Deleting...
                                            </div>
                                        ) : (
                                            "Delete"
                                        )}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <div className="justify-self-end">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Details"
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
} 