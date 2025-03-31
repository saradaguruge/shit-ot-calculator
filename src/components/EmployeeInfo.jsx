function EmployeeInfo({ employee }) {
  if (!employee) return null;

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-md">
      <h2 className="text-lg font-semibold text-blue-900 mb-2">Employee Information</h2>
      <p className="text-blue-800">Name: {employee.EmpDisplayName}</p>
      <p className="text-blue-800">Employee Number: {employee.EmpDisplayNumber}</p>
    </div>
  );
}

export default EmployeeInfo; 