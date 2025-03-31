export const convertDecimalToTime = (decimal) => {
  const hours = Math.floor(decimal)
  const minutes = Math.round((decimal - hours) * 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
}

export const convertTimeToDecimal = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours + minutes / 60
}

export const formatMinutes = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.round(minutes % 60)
  return `${hours}h ${remainingMinutes}m`
}

export const calculateWorkingHours = (records, monthlyThreshold) => {
  let totalMins = 0
  let totalOvertime = 0

  if (records) {
    records.forEach(entry => {
      // Skip off shifts
      if (entry.IsOffShift === 1) return

      const inTime = entry.InTime
      const outTime = entry.OutTime
      
      // Skip if either time is -1.0 (indicating no work done)
      if (inTime === -1.0 || outTime === -1.0) return

      const inDate = new Date(entry.InDate)
      const outDate = new Date(entry.OutDate)
      
      if (inTime && outTime) {
        const inHours = Math.floor(inTime)
        const inMinutes = Math.round((inTime - inHours) * 60)
        const outHours = Math.floor(outTime)
        const outMinutes = Math.round((outTime - outHours) * 60)

        // Set the time components to the dates
        inDate.setHours(inHours, inMinutes, 0)
        outDate.setHours(outHours, outMinutes, 0)

        // If out date is before in date, it means the shift ended the next day
        if (outDate < inDate) {
          outDate.setDate(outDate.getDate() + 1)
        }

        // Calculate difference in minutes
        const diffInMinutes = (outDate - inDate) / (1000 * 60)
        totalMins += diffInMinutes
        totalOvertime += entry.TotalOvertime || 0
      }
    })
  }

  const thresholdMinutes = monthlyThreshold * 60
  return {
    totalMinutes: Math.round(totalMins),
    differenceMinutes: Math.round(totalMins - thresholdMinutes)
  }
} 