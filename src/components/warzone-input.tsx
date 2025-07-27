"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface WarzoneInputProps {
  id: string
  name: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  warzones: number[]
}

export function WarzoneInput({
  id,
  name,
  required = false,
  placeholder = "e.g., 1",
  disabled = false,
  warzones
}: WarzoneInputProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get unique warzones sorted numerically
  const uniqueWarzones = [...new Set(warzones)].sort((a, b) => a - b)

  // Filter warzones based on input value
  const filteredWarzones = uniqueWarzones.filter(warzone =>
    warzone.toString().includes(inputValue)
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setSelectedIndex(-1)

    if (value === "") {
      setIsDropdownOpen(uniqueWarzones.length > 0)
    } else {
      setIsDropdownOpen(filteredWarzones.length > 0)
    }
  }

  const handleInputFocus = () => {
    if (uniqueWarzones.length > 0) {
      setIsDropdownOpen(true)
    }
  }

  const handleInputClick = () => {
    if (uniqueWarzones.length > 0) {
      setIsDropdownOpen(!isDropdownOpen)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || filteredWarzones.length === 0) {
      if (e.key === 'Tab') {
        // Allow normal tab behavior
        return
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < filteredWarzones.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : filteredWarzones.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredWarzones.length) {
          handleWarzoneSelect(filteredWarzones[selectedIndex])
        } else if (filteredWarzones.length === 1) {
          // Auto-select if only one item
          handleWarzoneSelect(filteredWarzones[0])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsDropdownOpen(false)
        setSelectedIndex(-1)
        break
      case 'Tab':
        // Close dropdown and allow normal tab behavior
        setIsDropdownOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleWarzoneSelect = (warzone: number) => {
    setInputValue(warzone.toString())
    setIsDropdownOpen(false)
    setSelectedIndex(-1)

    // Update the input value for form submission
    if (inputRef.current) {
      inputRef.current.value = warzone.toString()
    }

    // Move focus to next field after a short delay
    setTimeout(() => {
      const nextInput = inputRef.current?.closest('form')?.querySelector('input[name="coordinate_x"]') as HTMLInputElement
      if (nextInput) {
        nextInput.focus()
      }
    }, 10)
  }

  // Auto-select if only one filtered item
  useEffect(() => {
    if (filteredWarzones.length === 1 && inputValue !== "" && isDropdownOpen) {
      setSelectedIndex(0)
    } else {
      setSelectedIndex(-1)
    }
  }, [filteredWarzones.length, inputValue, isDropdownOpen])

  return (
    <div className="relative">
      <Label htmlFor={id}>Warzone</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          name={name}
          type="number"
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
        />
      </div>

      {isDropdownOpen && filteredWarzones.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
              {inputValue ? `Filtered warzones (${filteredWarzones.length})` : `Previously used warzones (${filteredWarzones.length})`}
            </div>
            {filteredWarzones.map((warzone, index) => (
              <button
                key={warzone}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${index === selectedIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                  } focus:outline-none`}
                onClick={() => handleWarzoneSelect(warzone)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                Warzone {warzone}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 