'use client';

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <div className={cn("flex justify-center items-center gap-2", className)}>
      <Button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        variant="outline"
        size="sm"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>
      
      <span className="px-4 py-2 text-white text-sm">
        Page {currentPage} of {totalPages}
      </span>
      
      <Button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        variant="outline"
        size="sm"
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  )
}
