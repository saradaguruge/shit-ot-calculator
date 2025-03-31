import { useState } from 'react'
import { convertDecimalToTime, convertTimeToDecimal } from '../utils/timeUtils'

function AttendanceTable({ records, onEditRecord, onSaveEdit, editingRecord }) {
  const [editValues, setEditValues] = useState({ inTime: '', outTime: '' })
  const [filters, setFilters] = useState({
    status: 'all',
    day: 'all',
    startDate: '',
    endDate: ''
  })

  const getRecordStatus = (record) => {
    const isWeekendDay = isWeekend(record.InDate)
    
    // If it's marked as off shift, it's an off day
    if (record.IsOffShift === 1) return 'Off Day'
    
    // If it's a weekend and both times are missing, it's not a working day
    if (isWeekendDay && record.InTime === -1.0 && record.OutTime === -1.0) return 'Not Working'
    
    // If both times are missing on a weekday, it's a missing record
    if (record.InTime === -1.0 && record.OutTime === -1.0) return 'Missing Record'
    
    // If either time is missing, it's an incomplete record
    if (record.InTime === -1.0 || record.OutTime === -1.0) return 'Missing Record'
    
    // If the record was manually edited, mark it as such
    if (record.isEdited) return 'Manually Edited'
    
    // If we have both times and it's not a weekend, it's completed
    return 'Complete'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString)
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return weekdays[date.getDay()]
  }

  const isWeekend = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDay()
    return day === 0 || day === 6 // 0 is Sunday, 6 is Saturday
  }

  const calculateWorkingTime = (record) => {
    if (record.InTime === -1.0 || record.OutTime === -1.0) return 'N/A'
    
    const inTime = record.InTime
    const outTime = record.OutTime
    
    // Handle case where out time is on the next day
    let workingHours = outTime - inTime
    if (workingHours < 0) {
      workingHours += 24
    }
    
    const hours = Math.floor(workingHours)
    const minutes = Math.round((workingHours - hours) * 60)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const handleEditStart = (record) => {
    setEditValues({
      inTime: record.InTime !== -1.0 ? convertDecimalToTime(record.InTime).slice(0, 5) : '',
      outTime: record.OutTime !== -1.0 ? convertDecimalToTime(record.OutTime).slice(0, 5) : ''
    })
    onEditRecord(record)
  }

  const handleEditCancel = () => {
    setEditValues({ inTime: '', outTime: '' })
    onEditRecord(null)
  }

  const handleEditSave = (record) => {
    onSaveEdit(record, editValues.inTime, editValues.outTime)
    setEditValues({ inTime: '', outTime: '' })
  }

  const handleTimeChange = (type, value) => {
    setEditValues(prev => ({
      ...prev,
      [type]: value
    }))
  }

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }))
  }

  const filterRecords = (records) => {
    return records.filter(record => {
      const status = getRecordStatus(record)
      const dayOfWeek = getDayOfWeek(record.InDate)
      const recordDate = new Date(record.InDate)
      const startDate = filters.startDate ? new Date(filters.startDate) : null
      const endDate = filters.endDate ? new Date(filters.endDate) : null

      const statusMatch = filters.status === 'all' || status === filters.status
      const dayMatch = filters.day === 'all' || dayOfWeek === filters.day
      const dateMatch = (!startDate || recordDate >= startDate) && (!endDate || recordDate <= endDate)

      return statusMatch && dayMatch && dateMatch
    })
  }

  const filteredRecords = filterRecords(records)

  const calculateTotalWorkingTime = (records) => {
    let totalMinutes = 0
    
    records.forEach(record => {
      if (record.InTime !== -1.0 && record.OutTime !== -1.0) {
        let workingHours = record.OutTime - record.InTime
        if (workingHours < 0) {
          workingHours += 24
        }
        totalMinutes += Math.round(workingHours * 60)
      }
    })

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  if (records.length === 0) return null;

  const statusOptions = ['all', 'Complete', 'Missing Record', 'Manually Edited', 'Not Working', 'Off Day']
  const dayOptions = ['all', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Attendance Records</h3>
      
      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            {statusOptions.map(option => (
              <option key={option} value={option}>
                {option === 'all' ? 'All Statuses' : option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
          <select
            value={filters.day}
            onChange={(e) => handleFilterChange('day', e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            {dayOptions.map(option => (
              <option key={option} value={option}>
                {option === 'all' ? 'All Days' : option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Out Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.map((record, index) => {
              const status = getRecordStatus(record)
              const isMissing = status === 'Missing Record'
              const isEditing = editingRecord === record
              const weekend = isWeekend(record.InDate)
              const dayOfWeek = getDayOfWeek(record.InDate)
              const workingTime = calculateWorkingTime(record)
              
              return (
                <tr key={index} className={isMissing ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(record.InDate)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${weekend ? 'text-purple-600' : 'text-gray-900'}`}>
                    {dayOfWeek}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isEditing ? (
                      <input
                        type="time"
                        className="border rounded px-2 py-1"
                        value={editValues.inTime}
                        onChange={(e) => handleTimeChange('inTime', e.target.value)}
                      />
                    ) : (
                      record.InTime !== -1.0 ? convertDecimalToTime(record.InTime).slice(0, 5) : 'Missing'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isEditing ? (
                      <input
                        type="time"
                        className="border rounded px-2 py-1"
                        value={editValues.outTime}
                        onChange={(e) => handleTimeChange('outTime', e.target.value)}
                      />
                    ) : (
                      record.OutTime !== -1.0 ? convertDecimalToTime(record.OutTime).slice(0, 5) : 'Missing'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {workingTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${status === 'Complete' ? 'bg-green-100 text-green-800' : 
                        status === 'Missing Record' ? 'bg-red-100 text-red-800' :
                        status === 'Manually Edited' ? 'bg-yellow-100 text-yellow-800' :
                        status === 'Not Working' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(isMissing || status === 'Manually Edited') && !isEditing && (
                      <button
                        onClick={() => handleEditStart(record)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    )}
                    {isEditing && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditSave(record)}
                          className="text-green-600 hover:text-green-900"
                          disabled={!editValues.inTime || !editValues.outTime}
                        >
                          OK
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="4" className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                Total Working Time:
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {calculateTotalWorkingTime(filteredRecords)}
              </td>
              <td colSpan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default AttendanceTable; 