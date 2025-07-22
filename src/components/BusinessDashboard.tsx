'use client';

import { useState, useEffect, useCallback } from 'react';
import EmployeeDashboard from './EmployeeDashboard';

interface Employee {
  _id: string;
  name: string;
  username: string;
  createdAt: string;
}

interface IncomeEntry {
  _id: string;
  date: string;
  cashIncome: number;
  posIncome: number;
  expenses: number;
  user: {
    _id: string;
    name?: string;
    username: string;
  };
  createdAt: string;
}

interface MonthlyStats {
  month: string;
  totalCash: number;
  totalPos: number;
  totalExpenses: number;
  totalNet: number;
  userBreakdown: Array<{
    userId: string;
    name: string;
    cashIncome: number;
    posIncome: number;
    expenses: number;
  }>;
}

export default function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'income' | 'reports'>('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    username: '',
    password: ''
  });

  const [error, setError] = useState('');
  const getCurrentMonthRange = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Format dates without timezone conversion issues
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const firstDayOfMonth = new Date(year, month, 1);
    

    
    return {
      startDate: formatDate(firstDayOfMonth),
      endDate: formatDate(today)
    };
  };

  const [dateRange, setDateRange] = useState(getCurrentMonthRange());

  useEffect(() => {
    fetchEmployees();
    fetchEntries();
  }, []);

  // Fetch entries when date range changes or when refreshKey changes
  useEffect(() => {
    fetchEntries();
  }, [dateRange, refreshKey]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchEntries = useCallback(async () => {
    try {
      const url = `/api/income?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched entries:', data.entries);
        console.log('Business entries:', data.entries.filter((e: { userType: string }) => e.userType === 'Business'));
        console.log('Employee entries:', data.entries.filter((e: { userType: string }) => e.userType === 'Employee'));
        setEntries(data.entries);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let response;
      
      if (editingEmployee) {
        // Update existing employee
        response = await fetch(`/api/employees/${editingEmployee._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeFormData)
        });
      } else {
        // Create new employee
        response = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeFormData)
        });
      }

      if (response.ok) {
        fetchEmployees();
        setShowEmployeeForm(false);
        setEditingEmployee(null);
        setEmployeeFormData({ name: '', username: '', password: '' });
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      setError(editingEmployee ? 'Failed to update employee' : 'Failed to create employee');
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeFormData({
      name: employee.name,
      username: employee.username,
      password: ''
    });
    setShowEmployeeForm(true);
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchEmployees();
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch {
      setError('Failed to delete employee');
    }
  };



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getMonthlyStats = (): MonthlyStats[] => {
    const monthlyData: { [key: string]: MonthlyStats } = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          totalCash: 0,
          totalPos: 0,
          totalExpenses: 0,
          totalNet: 0,
          userBreakdown: []
        };
      }
      
      const monthStat = monthlyData[monthKey];
      monthStat.totalCash += entry.cashIncome;
      monthStat.totalPos += entry.posIncome;
      monthStat.totalExpenses += entry.expenses;
      monthStat.totalNet = monthStat.totalCash + monthStat.totalPos - monthStat.totalExpenses;
      
      // Update user breakdown
      const userName = entry.user.name || entry.user.username;
      let userStat = monthStat.userBreakdown.find(u => u.userId === entry.user._id);
      if (!userStat) {
        userStat = {
          userId: entry.user._id,
          name: userName,
          cashIncome: 0,
          posIncome: 0,
          expenses: 0
        };
        monthStat.userBreakdown.push(userStat);
      }
      
      userStat.cashIncome += entry.cashIncome;
      userStat.posIncome += entry.posIncome;
      userStat.expenses += entry.expenses;
    });
    
    return Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month));
  };

  const getTotalStats = () => {
    const totals = entries.reduce(
      (acc, entry) => ({
        cash: acc.cash + entry.cashIncome,
        pos: acc.pos + entry.posIncome,
        expenses: acc.expenses + entry.expenses
      }),
      { cash: 0, pos: 0, expenses: 0 }
    );
    
    return {
      ...totals,
      net: totals.cash + totals.pos - totals.expenses
    };
  };

  const getCurrentMonthStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });
    
    console.log('Current month entries for stats:', currentMonthEntries);
    console.log('All entries for debugging:', entries);
    
    const totals = currentMonthEntries.reduce(
      (acc, entry) => ({
        cash: acc.cash + entry.cashIncome,
        pos: acc.pos + entry.posIncome,
        expenses: acc.expenses + entry.expenses
      }),
      { cash: 0, pos: 0, expenses: 0 }
    );
    
    console.log('Calculated totals:', totals);
    
    return {
      ...totals,
      net: totals.cash + totals.pos - totals.expenses
    };
  };

  // const stats = getTotalStats();
  const currentMonthStats = getCurrentMonthStats();
  const monthlyStats = getMonthlyStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Business Dashboard</h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'employees', label: 'Employees' },
            { key: 'income', label: 'My Income' },
            { key: 'reports', label: 'Reports' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
                // Refresh data when switching to overview or reports, for the date filter
                if (tab.key === 'overview' || tab.key === 'reports') {
                  setRefreshKey(prev => prev + 1);
                }
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400">Total Employees</h3>
              <p className="text-3xl font-bold text-white mt-2">{employees.length}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400">Selected Range Cash Income</h3>
              <p className="text-3xl font-bold text-green-400 mt-2">{formatCurrency(currentMonthStats.cash)}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400">Selected Range POS Income</h3>
              <p className="text-3xl font-bold text-green-400 mt-2">{formatCurrency(currentMonthStats.pos)}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400">Selected Range Expenses</h3>
              <p className="text-3xl font-bold text-red-400 mt-2">{formatCurrency(currentMonthStats.expenses)}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400">Selected Range Net Profit</h3>
              <p className={`text-3xl font-bold mt-2 ${currentMonthStats.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(currentMonthStats.net)}
              </p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Date Range Filter</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchEntries}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Employee Management</h2>
            <button
              onClick={() => {
                setShowEmployeeForm(true);
                setEditingEmployee(null);
                setEmployeeFormData({ name: '', username: '', password: '' });
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Add Employee
            </button>
          </div>

          {showEmployeeForm && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h3>
              
              <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={employeeFormData.name}
                    onChange={(e) => setEmployeeFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={employeeFormData.username}
                    onChange={(e) => setEmployeeFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password {editingEmployee && '(leave empty to keep current password)'}
                  </label>
                  <input
                    type="password"
                    value={employeeFormData.password}
                    onChange={(e) => setEmployeeFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!editingEmployee}
                    placeholder={editingEmployee ? "Leave empty to keep current password" : "Enter password"}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {editingEmployee ? 'Update Employee' : 'Add Employee'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmployeeForm(false);
                      setEditingEmployee(null);

                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Employees</h3>
            </div>
            
            {employees.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                No employees found. Add your first employee to get started!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {employees.map((employee) => (
                      <tr key={employee._id} className="text-gray-300">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {employee.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {employee.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDateForDisplay(employee.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditEmployee(employee)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee._id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Income Tab */}
      {activeTab === 'income' && (
        <EmployeeDashboard key={`business-income-${refreshKey}`} />
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Monthly Reports</h2>

          {monthlyStats.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center text-gray-400">
              No data available for the selected date range.
            </div>
          ) : (
            <div className="space-y-8">
              {monthlyStats.map((monthStat, index) => (
                <div key={index} className="bg-gray-800 rounded-lg border border-gray-700">
                  <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">{formatDateForDisplay(dateRange.startDate)} - {formatDateForDisplay(dateRange.endDate)}</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-400">Cash Income</p>
                        <p className="text-xl font-bold text-green-400">{formatCurrency(monthStat.totalCash)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">POS Income</p>
                        <p className="text-xl font-bold text-green-400">{formatCurrency(monthStat.totalPos)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Expenses</p>
                        <p className="text-xl font-bold text-red-400">{formatCurrency(monthStat.totalExpenses)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Net Profit</p>
                        <p className={`text-xl font-bold ${monthStat.totalNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(monthStat.totalNet)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h4 className="text-md font-semibold text-white mb-4">User Breakdown</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-700">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Cash Income
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              POS Income
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Expenses
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Net
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {monthStat.userBreakdown.map((userStat) => {
                            const userNet = userStat.cashIncome + userStat.posIncome - userStat.expenses;
                            return (
                              <tr key={userStat.userId} className="text-gray-300">
                                <td className="px-4 py-2 whitespace-nowrap">{userStat.name}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-green-400">
                                  {formatCurrency(userStat.cashIncome)}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-green-400">
                                  {formatCurrency(userStat.posIncome)}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-red-400">
                                  {formatCurrency(userStat.expenses)}
                                </td>
                                <td className={`px-4 py-2 whitespace-nowrap font-medium ${userNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {formatCurrency(userNet)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 