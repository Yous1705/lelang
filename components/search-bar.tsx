"use client"

import { useState } from "react"

interface SearchBarProps {
  onSearch: (query: string, minPrice?: number, maxPrice?: number, status?: string) => void
  isLoading?: boolean
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [status, setStatus] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  function handleSearch() {
    onSearch(query, minPrice ? Number(minPrice) : undefined, maxPrice ? Number(maxPrice) : undefined, status)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Search auctions by title or description..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 px-4 py-2 border border-border rounded-md input-focus text-sm sm:text-base"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-primary text-white px-4 sm:px-6 py-2 rounded-md font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          Search
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 border border-border rounded-md font-medium hover:bg-surface transition-colors"
        >
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-surface p-4 rounded-md border border-border space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Min Price</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-border rounded-md input-focus text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Max Price</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="No limit"
                className="w-full px-3 py-2 border border-border rounded-md input-focus text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md input-focus text-sm"
              >
                <option value="all">All Auctions</option>
                <option value="active">Active Only</option>
                <option value="ended">Ended Only</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  )
}
