import React from 'react'
import { cn } from '@blinkdotnew/ui'
import { isAfter, subDays, subHours } from 'date-fns'

interface Props {
  gender: 'male' | 'female'
  view: 'front' | 'back'
  siteStatus: Record<string, string> // site -> last date
}

const PIN_POSITIONS: Record<string, Record<string, { x: number, y: number }>> = {
  male: {
    front: {
      'abdomen-left': { x: 42, y: 48 },
      'abdomen-right': { x: 58, y: 48 },
      'abdomen-center': { x: 50, y: 52 },
      'thigh-left': { x: 40, y: 70 },
      'thigh-right': { x: 60, y: 70 },
      'arm-left': { x: 28, y: 35 },
      'arm-right': { x: 72, y: 35 },
    },
    back: {
      'glute-left': { x: 42, y: 58 },
      'glute-right': { x: 58, y: 58 },
    }
  },
  female: {
    front: {
      'abdomen-left': { x: 42, y: 48 },
      'abdomen-right': { x: 58, y: 48 },
      'abdomen-center': { x: 50, y: 52 },
      'thigh-left': { x: 40, y: 70 },
      'thigh-right': { x: 60, y: 70 },
      'arm-left': { x: 28, y: 35 },
      'arm-right': { x: 72, y: 35 },
    },
    back: {
      'glute-left': { x: 42, y: 58 },
      'glute-right': { x: 58, y: 58 },
    }
  }
}

export function BodyMap({ gender, view, siteStatus }: Props) {
  const pins = PIN_POSITIONS[gender][view] || {}

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      {/* Simplified Body SVG placeholder */}
      <div className="relative w-[280px] h-[450px]">
        <svg viewBox="0 0 100 160" className="w-full h-full fill-muted-foreground/10 stroke-muted-foreground/20 stroke-2">
          {/* Head */}
          <circle cx="50" cy="15" r="10" />
          {/* Torso */}
          <path d="M35 25 L65 25 L70 60 L30 60 Z" />
          {/* Hips */}
          <path d="M30 60 L70 60 L75 80 L25 80 Z" />
          {/* Arms */}
          <path d="M35 30 L20 60 L25 65 L35 40" />
          <path d="M65 30 L80 60 L75 65 L65 40" />
          {/* Legs */}
          <path d="M30 80 L35 150 L45 150 L48 80" />
          <path d="M70 80 L65 150 L55 150 L52 80" />
        </svg>

        {/* Pins */}
        {Object.entries(pins).map(([site, pos]) => {
          const lastDate = siteStatus[site]
          let statusColor = "bg-primary/20 border-primary/50"
          let isRecent = false
          
          if (lastDate) {
            const date = new Date(lastDate)
            if (isAfter(date, subHours(new Date(), 24))) {
              statusColor = "bg-primary shadow-[0_0_12px_rgba(167,139,250,1)] scale-125"
              isRecent = true
            } else if (isAfter(date, subDays(new Date(), 7))) {
              statusColor = "bg-primary/70"
            } else {
              statusColor = "bg-primary/40"
            }
          }

          return (
            <div 
              key={site}
              className={cn(
                "absolute h-4 w-4 rounded-full border border-background transition-all duration-300 flex items-center justify-center group",
                statusColor
              )}
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="absolute top-full mt-2 hidden group-hover:block bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-xl border border-border whitespace-nowrap z-50">
                {site.replace('-', ' ')}
              </div>
              {isRecent && (
                <div className="absolute inset-0 rounded-full animate-ping bg-primary opacity-50" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
