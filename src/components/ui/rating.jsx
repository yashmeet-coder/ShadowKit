import React, { useState } from "react"
import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

const ratingVariants = {
  default: {
    star: "tw-text-primary",
    emptyStar: "tw-text-muted-foreground",
  },
  yellow: {
    star: "tw-text-yellow-500",
    emptyStar: "tw-text-yellow-200",
  },
}

export const StarRating = ({
  totalStars = 5,
  size = 32,
  variant = "default",
  onRatingChange,
  ...props
}) => {
  const [hoverRating, setHoverRating] = useState(null)
  const [currentRating, setCurrentRating] = useState(0)

  const handleMouseEnter = (event) => {
    setHoverRating(parseInt(event.currentTarget.dataset.starIndex || "0"))
  }

  const handleMouseLeave = () => setHoverRating(null)

  const handleClick = (event) => {
    const starIndex = parseInt(event.currentTarget.dataset.starIndex || "0")
    setCurrentRating(starIndex)
    setHoverRating(null)
    onRatingChange?.(starIndex)
  }

  const displayRating = hoverRating ?? currentRating

  return (
    <div
      className="tw-flex tw-w-fit tw-items-center tw-gap-1"
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {[...Array(totalStars)].map((_, i) => {
        const filled = i < displayRating
        return React.cloneElement(<Star />, {
          key: i,
          size,
          className: cn(
            "tw-cursor-pointer tw-transition-colors",
            filled ? "tw-fill-current tw-stroke-1" : "tw-fill-transparent",
            filled ? ratingVariants[variant].star : ratingVariants[variant].emptyStar
          ),
          onClick: handleClick,
          onMouseEnter: handleMouseEnter,
          "data-star-index": i + 1,
        })
      })}
    </div>
  )
}
