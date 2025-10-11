"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

const MONTHS = [
  { name: "September", year: 2025, days: 30, startDay: 1 }, // Sept 1, 2025 is a Monday (1)
  { name: "October", year: 2025, days: 31, startDay: 3 }, // Oct 1, 2025 is a Wednesday (3)
  { name: "November", year: 2025, days: 30, startDay: 6 }, // Nov 1, 2025 is a Saturday (6)
  { name: "December", year: 2025, days: 31, startDay: 1 }, // Dec 1, 2025 is a Monday (1)
]

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]

export default function MinimalCalendar() {
  const [markedDates, setMarkedDates] = useState<Record<string, "yes" | "no">>({})

  useEffect(() => {
    const savedDates = localStorage.getItem("calendar-marked-dates")
    if (savedDates) {
      try {
        setMarkedDates(JSON.parse(savedDates))
      } catch (error) {
        console.error("Failed to parse saved dates:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("calendar-marked-dates", JSON.stringify(markedDates))
  }, [markedDates])

  const today = new Date()
  const todayKey = `${today.toLocaleString("default", { month: "long" })}-${today.getDate()}`

  const isDateInFuture = (month: string, day: number) => {
    const dateToCheck = new Date(2025, MONTHS.findIndex((m) => m.name === month) + 8, day) // +8 because Sept is month 9 (0-indexed)
    return dateToCheck > today
  }

  const toggleDate = (dateKey: string, month: string, day: number) => {
    if (isDateInFuture(month, day)) return

    setMarkedDates((prev) => {
      const current = prev[dateKey]
      if (!current) return { ...prev, [dateKey]: "yes" }
      if (current === "yes") return { ...prev, [dateKey]: "no" }
      const { [dateKey]: _, ...rest } = prev
      return rest
    })
  }

  const getDateKey = (month: string, day: number) => `${month}-${day}`

  const calculateStats = () => {
    const totalDays = MONTHS.reduce((sum, month) => sum + month.days, 0)
    const markedCount = Object.keys(markedDates).length
    const yesCount = Object.values(markedDates).filter((status) => status === "yes").length
    const noCount = Object.values(markedDates).filter((status) => status === "no").length
    const unmarkedCount = totalDays - markedCount

    const calculateStreaks = () => {
      const sortedDates = Object.entries(markedDates)
        .map(([key, status]) => {
          const [monthName, dayStr] = key.split("-")
          const monthIndex = MONTHS.findIndex((m) => m.name === monthName)
          const day = Number.parseInt(dayStr)
          return { monthIndex, day, status, date: new Date(2025, monthIndex + 8, day) }
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime())

      let currentYesStreak = 0
      let currentNoStreak = 0
      let longestYesStreak = 0
      let longestNoStreak = 0
      let tempYesStreak = 0
      let tempNoStreak = 0

      // Calculate current streaks from today backwards
      const todayDate = new Date()
      for (let i = sortedDates.length - 1; i >= 0; i--) {
        const entry = sortedDates[i]
        if (entry.date <= todayDate) {
          if (entry.status === "yes") {
            currentYesStreak = currentYesStreak === 0 ? 1 : currentYesStreak + 1
            currentNoStreak = 0
          } else if (entry.status === "no") {
            currentNoStreak = currentNoStreak === 0 ? 1 : currentNoStreak + 1
            currentYesStreak = 0
          }
          break
        }
      }

      // Calculate longest streaks
      for (const entry of sortedDates) {
        if (entry.status === "yes") {
          tempYesStreak++
          tempNoStreak = 0
          longestYesStreak = Math.max(longestYesStreak, tempYesStreak)
        } else if (entry.status === "no") {
          tempNoStreak++
          tempYesStreak = 0
          longestNoStreak = Math.max(longestNoStreak, tempNoStreak)
        }
      }

      return { currentYesStreak, currentNoStreak, longestYesStreak, longestNoStreak }
    }

    const calculateMonthlyStats = () => {
      return MONTHS.map((month) => {
        const monthEntries = Object.entries(markedDates).filter(([key]) => key.startsWith(month.name))
        const monthYes = monthEntries.filter(([, status]) => status === "yes").length
        const monthNo = monthEntries.filter(([, status]) => status === "no").length
        const monthMarked = monthEntries.length
        const monthTotal = month.days
        const monthCompletion = monthTotal > 0 ? Math.round((monthMarked / monthTotal) * 100) : 0

        return {
          name: month.name.slice(0, 3),
          yes: monthYes,
          no: monthNo,
          marked: monthMarked,
          total: monthTotal,
          completion: monthCompletion,
        }
      })
    }

    const streaks = calculateStreaks()
    const monthlyStats = calculateMonthlyStats()

    return {
      totalDays,
      markedCount,
      yesCount,
      noCount,
      unmarkedCount,
      streaks,
      monthlyStats,
      yesPercentage: markedCount > 0 ? Math.round((yesCount / markedCount) * 100) : 0,
      completionRate: Math.round((markedCount / totalDays) * 100),
    }
  }

  const stats = calculateStats()

  const renderMonth = (month: (typeof MONTHS)[0]) => {
    const days = []

    // Add empty cells for days before the month starts
    for (let i = 0; i < month.startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-6 flex items-center justify-center" />)
    }

    // Add all days of the month
    for (let day = 1; day <= month.days; day++) {
      const dateKey = getDateKey(month.name, day)
      const status = markedDates[dateKey]
      const isToday = dateKey === todayKey
      const isFuture = isDateInFuture(month.name, day)

      days.push(
        <div key={day} className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 text-xs font-mono flex items-center justify-center ${
              isToday
                ? "ring-1 ring-blue-400 bg-blue-500/20 text-blue-300" // Today's date styling
                : status === "yes"
                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  : status === "no"
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : isFuture
                      ? "text-gray-400 cursor-not-allowed" // Future dates styling
                      : "hover:bg-white/10 text-gray-300 cursor-pointer"
            }`}
            onClick={() => toggleDate(dateKey, month.name, day)}
            disabled={isFuture} // Disable future dates
          >
            {day}
          </Button>
        </div>,
      )
    }

    return days
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-50">
        <svg
          width="642"
          height="212"
          viewBox="0 0 642 212"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
          preserveAspectRatio="xMidYMid meet"
        >
          <mask
            id="mask0_603_1196-responsive"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="642"
            height="212"
          >
            <rect width="642" height="212" fill="url(#paint0_linear_603_1196-responsive)"></rect>
          </mask>
          <g mask="url(#mask0_603_1196-responsive)">
            <path
              d="M114.193 56.7002L247.3 189.807V56.7002H297.5V225C297.5 244.606 281.606 260.5 262 260.5C252.632 260.5 243.391 256.887 236.754 250.25L43.207 56.7002H114.193ZM507.6 5.5C547.088 5.5 579.1 37.5116 579.1 77V209.3H528.9V91.3926L409.993 210.3H527.9V260.5H395.6C356.111 260.5 324.1 228.488 324.1 189V56.7002H374.3V175.007L375.153 174.153L492.754 56.5537L493.607 55.7002H375.3V5.5H507.6Z"
              stroke="currentColor"
              strokeOpacity="0.1"
            ></path>
          </g>
          <defs>
            <linearGradient
              id="paint0_linear_603_1196-responsive"
              x1="321"
              y1="212"
              x2="321"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="white" stopOpacity="0"></stop>
              <stop offset="0.987475" stopColor="white"></stop>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 p-3">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-mono text-white/80 text-center mb-4">The Great Lock-in of Sep-Dec 2025</h1>

          <div className="grid grid-cols-2 gap-2">
            {MONTHS.map((month) => (
              <div key={month.name} className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-3">
                <h2 className="text-sm font-mono text-white/60 mb-2 text-center">{month.name.slice(0, 3)}</h2>

                <div className="grid grid-cols-7 gap-px mb-1">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day}
                      className="text-xs text-white/40 text-center font-mono h-4 flex items-center justify-center"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-px">{renderMonth(month)}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-3">
            {/* Overall Progress */}
            <div className="mb-3">
              <div className="flex justify-between text-xs font-mono text-white/60 mb-1">
                <span>Overall Progress</span>
                <span>{stats.completionRate}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-4 gap-2 mb-3 text-xs font-mono text-center">
              <div className="bg-green-500/10 border border-green-500/20 rounded p-1.5">
                <div className="text-green-400 font-bold">{stats.yesCount}</div>
                <div className="text-green-400/60">Yes</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded p-1.5">
                <div className="text-red-400 font-bold">{stats.noCount}</div>
                <div className="text-red-400/60">No</div>
              </div>
              <div className="bg-gray-500/10 border border-gray-500/20 rounded p-1.5">
                <div className="text-gray-400 font-bold">{stats.unmarkedCount}</div>
                <div className="text-gray-400/60">Left</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded p-1.5">
                <div className="text-blue-400 font-bold">{stats.yesPercentage}%</div>
                <div className="text-blue-400/60">Yes Rate</div>
              </div>
            </div>

            {/* Streaks */}
            <div className="mb-3">
              <div className="text-xs font-mono text-white/60 mb-1">Current Streaks</div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="flex gap-2">
                  <span className="text-green-400">Yes:</span>
                  <span className="text-white/80">{stats.streaks.currentYesStreak} days</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-red-400">No:</span>
                  <span className="text-white/80">{stats.streaks.currentNoStreak} days</span>
                </div>
              </div>
            </div>

            {/* Best Streaks */}
            <div className="mb-3">
              <div className="text-xs font-mono text-white/60 mb-1">Best Streaks</div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="flex gap-2">
                  <span className="text-green-400">Yes:</span>
                  <span className="text-white/80">{stats.streaks.longestYesStreak} days</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-red-400">No:</span>
                  <span className="text-white/80">{stats.streaks.longestNoStreak} days</span>
                </div>
              </div>
            </div>

            {/* Monthly Breakdown */}
            <div>
              <div className="text-xs font-mono text-white/60 mb-2">Monthly Breakdown</div>
              <div className="space-y-1">
                {stats.monthlyStats.map((month) => (
                  <div key={month.name} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white/60 w-8">{month.name}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex gap-1 text-xs">
                        <span className="text-green-400">{month.yes}</span>
                        <span className="text-white/40">/</span>
                        <span className="text-red-400">{month.no}</span>
                      </div>
                      <div className="flex-1 bg-white/10 rounded-full h-1 mx-2">
                        <div
                          className="bg-white/40 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${month.completion}%` }}
                        />
                      </div>
                      <span className="text-white/40 text-xs w-8 text-right">{month.completion}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
