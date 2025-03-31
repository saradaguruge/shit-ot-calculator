import { useState } from 'react'
import EmployeeInfo from './components/EmployeeInfo'
import TimeCalculator from './components/TimeCalculator'
import AttendanceTable from './components/AttendanceTable'
import { calculateWorkingHours, convertTimeToDecimal } from './utils/timeUtils'

function App() {
  const [jsonInput, setJsonInput] = useState('')
  const [monthlyThreshold, setMonthlyThreshold] = useState(180)
  const [error, setError] = useState('')
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [differenceMinutes, setDifferenceMinutes] = useState(0)
  const [employeeInfo, setEmployeeInfo] = useState(null)
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [editingRecord, setEditingRecord] = useState(null)

  const handleEditRecord = (record) => {
    setEditingRecord(record)
  }

  const handleSaveEdit = (record, inTime, outTime) => {
    const updatedRecords = attendanceRecords.map(r => {
      if (r === record) {
        return {
          ...r,
          InTime: inTime ? convertTimeToDecimal(inTime) : -1.0,
          OutTime: outTime ? convertTimeToDecimal(outTime) : -1.0,
          isEdited: true
        }
      }
      return r
    })
    setAttendanceRecords(updatedRecords)
    setEditingRecord(null)
    
    // Recalculate working hours with updated records
    const { totalMinutes, differenceMinutes } = calculateWorkingHours(updatedRecords, monthlyThreshold)
    setTotalMinutes(totalMinutes)
    setDifferenceMinutes(differenceMinutes)
  }

  const processJsonData = (jsonData) => {
    try {
      const data = JSON.parse(jsonData)
      
      // Extract employee information if available
      if (data.EmployeeList && data.EmployeeList.length > 0) {
        setEmployeeInfo(data.EmployeeList[0])
      }

      // Store attendance records for display
      if (data.AttendanceSummaryDetailList) {
        setAttendanceRecords(data.AttendanceSummaryDetailList)
      }

      // Calculate working hours
      const { totalMinutes: total, differenceMinutes: diff } = calculateWorkingHours(
        data.AttendanceSummaryDetailList,
        monthlyThreshold
      )
      
      setTotalMinutes(total)
      setDifferenceMinutes(diff)
      setError('')
    } catch (err) {
      setError('Invalid JSON format. Please check your input.')
      setTotalMinutes(0)
      setDifferenceMinutes(0)
      setEmployeeInfo(null)
      setAttendanceRecords([])
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setJsonInput(value)
    if (value.trim()) {
      processJsonData(value)
    }
  }

  const handleThresholdChange = (e) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value)) {
      setMonthlyThreshold(value)
      if (jsonInput.trim()) {
        processJsonData(jsonInput)
      }
    }
  }

  const handleCalculate = () => {
    if (jsonInput.trim()) {
      processJsonData(jsonInput)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-7xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-7xl mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Working Hours Calculator</h1>
                
                {/* Employee Information */}
                <EmployeeInfo employee={employeeInfo} />

                {/* Monthly Threshold Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Working Hours Threshold
                  </label>
                  <input
                    type="number"
                    value={monthlyThreshold}
                    onChange={handleThresholdChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Enter monthly threshold"
                  />
                </div>

                {/* JSON Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attendance Data (JSON)
                  </label>
                  <textarea
                    value={jsonInput}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-32"
                    placeholder="Paste JSON data here"
                  />
                  {error && (
                    <div className="mt-2 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                </div>

                {/* Calculate Button */}
                <button
                  onClick={handleCalculate}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Calculate
                </button>

                {/* Results */}
                {/* {totalMinutes !== null && (
                  <TimeCalculator 
                    totalMinutes={totalMinutes} 
                    differenceMinutes={differenceMinutes}
                    monthlyThreshold={monthlyThreshold}
                  />
                )} */}

                {/* Attendance Table */}
                {attendanceRecords.length > 0 && (
                  <AttendanceTable
                    records={attendanceRecords}
                    onEditRecord={setEditingRecord}
                    onSaveEdit={handleSaveEdit}
                    editingRecord={editingRecord}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 