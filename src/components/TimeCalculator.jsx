function TimeCalculator({ totalMinutes, differenceMinutes }) {
  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.round(minutes % 60)
    return `${hours}h ${remainingMinutes}m`
  }

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-gray-500">Total Time Worked</h3>
        <p className="text-2xl font-bold text-gray-900">{formatMinutes(totalMinutes)}</p>
        <p className="text-sm text-gray-500">({totalMinutes} minutes)</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-gray-500">Difference from Threshold</h3>
        <p className={`text-2xl font-bold ${differenceMinutes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatMinutes(differenceMinutes)}
        </p>
        <p className="text-sm text-gray-500">({differenceMinutes} minutes)</p>
      </div>
    </div>
  );
}

export default TimeCalculator; 