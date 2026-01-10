/**
 * Schedule Generation Utilities
 *
 * Pure functions for generating study schedules.
 * Client-safe - no server dependencies.
 */

export interface ScheduleTimepoint {
  timepoint: string
  week: number
  instruments: string[]
  windowDays: number
  labs?: string[]
}

/**
 * Generate a default schedule when AI doesn't return one
 * Creates timepoints at reasonable intervals based on study duration
 */
export function generateDefaultSchedule(
  durationWeeks: number,
  instrumentIds: string[]
): ScheduleTimepoint[] {
  const schedule: ScheduleTimepoint[] = [
    { timepoint: 'baseline', week: 0, instruments: instrumentIds, windowDays: 3 },
  ]

  // Add timepoints at reasonable intervals based on duration
  if (durationWeeks >= 4) {
    schedule.push({ timepoint: 'week_2', week: 2, instruments: instrumentIds.slice(0, 2), windowDays: 3 })
  }
  if (durationWeeks >= 8) {
    schedule.push({ timepoint: 'week_4', week: 4, instruments: instrumentIds, windowDays: 5 })
  }
  if (durationWeeks >= 12) {
    schedule.push({ timepoint: 'week_8', week: 8, instruments: instrumentIds, windowDays: 5 })
  }
  if (durationWeeks >= 16) {
    schedule.push({ timepoint: 'week_12', week: 12, instruments: instrumentIds, windowDays: 7 })
  }
  if (durationWeeks >= 20) {
    schedule.push({ timepoint: 'week_16', week: 16, instruments: instrumentIds, windowDays: 7 })
  }
  if (durationWeeks >= 26) {
    schedule.push({ timepoint: 'week_20', week: 20, instruments: instrumentIds, windowDays: 7 })
  }

  // Final timepoint at the end of study
  if (durationWeeks > 4) {
    schedule.push({
      timepoint: `week_${durationWeeks}`,
      week: durationWeeks,
      instruments: instrumentIds,
      windowDays: 7
    })
  }

  return schedule
}
