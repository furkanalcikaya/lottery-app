'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
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
  user: {
    _id: string;
    name?: string;
    username: string;
  };
  createdAt: string;
}

interface ExpenseEntry {
  _id: string;
  date: string;
  description: string;
  amount: number;
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
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'income' | 'reports'>('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showEmployeePassword, setShowEmployeePassword] = useState(false);
  const [showEmployeeConfirmPassword, setShowEmployeeConfirmPassword] = useState(false);
  const [showBusinessPasswordForm, setShowBusinessPasswordForm] = useState(false);
  const [businessPasswordData, setBusinessPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showBusinessCurrentPassword, setShowBusinessCurrentPassword] = useState(false);
  const [showBusinessNewPassword, setShowBusinessNewPassword] = useState(false);
  const [showBusinessConfirmPassword, setShowBusinessConfirmPassword] = useState(false);

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

  const setThisMonthRange = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setDateRange({
      startDate: formatDate(firstDayOfMonth),
      endDate: formatDate(lastDayOfMonth)
    });
  };

  const setTodayRange = () => {
    const today = new Date();
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const todayStr = formatDate(today);
    
    setDateRange({
      startDate: todayStr,
      endDate: todayStr
    });
  };

  useEffect(() => {
    fetchEmployees();
    fetchEntries();
    fetchExpenses();
  }, []);

  // Fetch entries when date range changes or when refreshKey changes
  useEffect(() => {
    fetchEntries();
    fetchExpenses();
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

  const fetchExpenses = useCallback(async () => {
    try {
      const url = `/api/expenses?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched expenses:', data.expenses);
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password confirmation for new employees or when changing password
    if (!editingEmployee || employeeFormData.password) {
      if (employeeFormData.password !== employeeFormData.confirmPassword) {
        setError(t('common.password_mismatch'));
        return;
      }
      if (employeeFormData.password.length < 6) {
        setError(t('common.password_too_short'));
        return;
      }
    }

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
        setEmployeeFormData({ name: '', username: '', password: '', confirmPassword: '' });
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
      password: '',
      confirmPassword: ''
    });
    setShowEmployeePassword(false);
    setShowEmployeeConfirmPassword(false);
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

  const handleBusinessPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (businessPasswordData.newPassword !== businessPasswordData.confirmPassword) {
      setError(t('common.password_mismatch'));
      return;
    }
    if (businessPasswordData.newPassword.length < 6) {
      setError(t('common.password_too_short'));
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: businessPasswordData.currentPassword,
          newPassword: businessPasswordData.newPassword
        })
      });

      if (response.ok) {
        setShowBusinessPasswordForm(false);
        setBusinessPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowBusinessCurrentPassword(false);
        setShowBusinessNewPassword(false);
        setShowBusinessConfirmPassword(false);
        // Show success message
        alert('Password changed successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch {
      setError('Failed to change password');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
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
    
    // Process income entries
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
      
      // Update user breakdown for income
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
    });
    
    // Process expense entries
    expenses.forEach(expense => {
      const date = new Date(expense.date);
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
      monthStat.totalExpenses += expense.amount;
      
      // Update user breakdown for expenses
      const userName = expense.user.name || expense.user.username;
      let userStat = monthStat.userBreakdown.find(u => u.userId === expense.user._id);
      if (!userStat) {
        userStat = {
          userId: expense.user._id,
          name: userName,
          cashIncome: 0,
          posIncome: 0,
          expenses: 0
        };
        monthStat.userBreakdown.push(userStat);
      }
      
      userStat.expenses += expense.amount;
    });
    
    // Calculate net totals for each month
    Object.values(monthlyData).forEach(monthStat => {
      monthStat.totalNet = monthStat.totalCash + monthStat.totalPos - monthStat.totalExpenses;
    });
    
    return Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month));
  };

  const getTotalStats = () => {
    const incomeTotals = entries.reduce(
      (acc, entry) => ({
        cash: acc.cash + entry.cashIncome,
        pos: acc.pos + entry.posIncome
      }),
      { cash: 0, pos: 0 }
    );
    
    const expenseTotal = expenses.reduce(
      (acc, expense) => acc + expense.amount,
      0
    );
    
    const totals = {
      ...incomeTotals,
      expenses: expenseTotal
    };
    
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
    
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    
    console.log('Current month entries for stats:', currentMonthEntries);
    console.log('Current month expenses for stats:', currentMonthExpenses);
    
    const incomeTotals = currentMonthEntries.reduce(
      (acc, entry) => ({
        cash: acc.cash + entry.cashIncome,
        pos: acc.pos + entry.posIncome
      }),
      { cash: 0, pos: 0 }
    );
    
    const expenseTotal = currentMonthExpenses.reduce(
      (acc, expense) => acc + expense.amount,
      0
    );
    
    const totals = {
      ...incomeTotals,
      expenses: expenseTotal
    };
    
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
        <h1 className="text-3xl font-bold text-white">{t('dashboard.business_title')}</h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { key: 'overview', label: t('dashboard.tabs.overview') },
            { key: 'employees', label: t('dashboard.tabs.employees') },
            { key: 'income', label: t('dashboard.tabs.my_income') },
            { key: 'reports', label: t('dashboard.tabs.reports') }
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
              <h3 className="text-sm font-medium text-gray-400">{t('overview.total_employees')}</h3>
              <p className="text-3xl font-bold text-white mt-2">{employees.length}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400">{t('overview.cash_income')}</h3>
              <p className="text-3xl font-bold text-green-400 mt-2">{formatCurrency(currentMonthStats.cash)}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400">{t('overview.pos_income')}</h3>
              <p className="text-3xl font-bold text-green-400 mt-2">{formatCurrency(currentMonthStats.pos)}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400">{t('overview.expenses')}</h3>
              <p className="text-3xl font-bold text-red-400 mt-2">{formatCurrency(currentMonthStats.expenses)}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400">{t('overview.net_profit')}</h3>
              <p className={`text-3xl font-bold mt-2 ${currentMonthStats.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(currentMonthStats.net)}
              </p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">{t('reports.date_filter')}</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('reports.start_date')}</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('reports.end_date')}</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 md:items-end ">
                <button
                  onClick={setThisMonthRange}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {t('reports.this_month')}
                </button>
                <button
                  onClick={setTodayRange}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {t('reports.today')}
                </button>
                <button
                  onClick={fetchEntries}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {t('reports.apply_filter')}
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
            <h2 className="text-xl font-semibold text-white">{t('employees.title')}</h2>
            <button
              onClick={() => {
                setShowEmployeeForm(true);
                setEditingEmployee(null);
                setEmployeeFormData({ name: '', username: '', password: '', confirmPassword: '' });
                setShowEmployeePassword(false);
                setShowEmployeeConfirmPassword(false);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
                              {t('employees.add_button')}
            </button>
          </div>

          {showBusinessPasswordForm && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                {t('employees.change_password')}
              </h3>
              
              <form onSubmit={handleBusinessPasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('login.current_password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showBusinessCurrentPassword ? "text" : "password"}
                      value={businessPasswordData.currentPassword}
                      onChange={(e) => setBusinessPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder={t('login.placeholder_current_password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowBusinessCurrentPassword(!showBusinessCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showBusinessCurrentPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m5.656 5.656l1.415 1.415m-1.415-1.415l1.415 1.415M14.828 14.828L16.243 16.243" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('login.new_password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showBusinessNewPassword ? "text" : "password"}
                      value={businessPasswordData.newPassword}
                      onChange={(e) => setBusinessPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder={t('login.placeholder_new_password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowBusinessNewPassword(!showBusinessNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showBusinessNewPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m5.656 5.656l1.415 1.415m-1.415-1.415l1.415 1.415M14.828 14.828L16.243 16.243" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('login.confirm_password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showBusinessConfirmPassword ? "text" : "password"}
                      value={businessPasswordData.confirmPassword}
                      onChange={(e) => setBusinessPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder={t('login.placeholder_confirm_password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowBusinessConfirmPassword(!showBusinessConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showBusinessConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m5.656 5.656l1.415 1.415m-1.415-1.415l1.415 1.415M14.828 14.828L16.243 16.243" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {t('employees.change_password')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBusinessPasswordForm(false);
                      setBusinessPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setShowBusinessCurrentPassword(false);
                      setShowBusinessNewPassword(false);
                      setShowBusinessConfirmPassword(false);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {t('employees.cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {showEmployeeForm && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingEmployee ? t('employees.edit_employee') : t('employees.add_employee')}
              </h3>
              
              <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('employees.name')}</label>
                  <input
                    type="text"
                    value={employeeFormData.name}
                    onChange={(e) => setEmployeeFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('employees.username')}</label>
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
                    {t('employees.password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showEmployeePassword ? "text" : "password"}
                      value={employeeFormData.password}
                      onChange={(e) => setEmployeeFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={!editingEmployee}
                      placeholder={editingEmployee ? t('employees.empty_password') : t('employees.enter_password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmployeePassword(!showEmployeePassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showEmployeePassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m5.656 5.656l1.415 1.415m-1.415-1.415l1.415 1.415M14.828 14.828L16.243 16.243" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {(!editingEmployee || employeeFormData.password) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('login.confirm_password')}
                    </label>
                    <div className="relative">
                      <input
                        type={showEmployeeConfirmPassword ? "text" : "password"}
                        value={employeeFormData.confirmPassword}
                        onChange={(e) => setEmployeeFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!editingEmployee || !!employeeFormData.password}
                        placeholder={t('login.placeholder_confirm_password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmployeeConfirmPassword(!showEmployeeConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        {showEmployeeConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m5.656 5.656l1.415 1.415m-1.415-1.415l1.415 1.415M14.828 14.828L16.243 16.243" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {editingEmployee ? t('employees.update') : t('employees.add_title')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmployeeForm(false);
                      setEditingEmployee(null);

                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {t('employees.cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">{t('employees.employees')}</h3>
            </div>
            
            {employees.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                {t('employees.no_employee')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        {t('employees.name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        {t('employees.username')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        {t('employees.created_date')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        {t('employees.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    
                    
                    {/* Employee Rows */}
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
                              {t('employees.edit')}
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee._id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              {t('employees.delete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {/* Business Owner Row */}
                    <tr className="text-gray-300 bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span>{user?.name}</span>
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded">
                            {t('employees.business_owner')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user?.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        -
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setShowBusinessPasswordForm(true);
                            setBusinessPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            setShowBusinessCurrentPassword(false);
                            setShowBusinessNewPassword(false);
                            setShowBusinessConfirmPassword(false);
                          }}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          {t('employees.change_password')}
                        </button>
                      </td>
                    </tr>
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
          <h2 className="text-xl font-semibold text-white">{t('reports.description')}</h2>

          {monthlyStats.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center text-gray-400">
              {t('reports.no_data')}
            </div>
          ) : (
            <div className="space-y-8">
              {monthlyStats.map((monthStat, index) => (
                <div key={index} className="bg-gray-800 rounded-lg border border-gray-700">
                  <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">{formatDateForDisplay(dateRange.startDate)} - {formatDateForDisplay(dateRange.endDate)}</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-400">{t('reports.cash_income')}</p>
                        <p className="text-xl font-bold text-green-400">{formatCurrency(monthStat.totalCash)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">{t('reports.pos_income')}</p>
                        <p className="text-xl font-bold text-green-400">{formatCurrency(monthStat.totalPos)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">{t('reports.expenses')}</p>
                        <p className="text-xl font-bold text-red-400">{formatCurrency(monthStat.totalExpenses)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">{t('reports.net_profit')}</p>
                        <p className={`text-xl font-bold ${monthStat.totalNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(monthStat.totalNet)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-8">
                    {/* User Income Breakdown */}
                    <div>
                      <h4 className="text-md font-semibold text-white mb-4">{t('reports.user_breakdown_income')}</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-700">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                {t('reports.user')}
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                {t('reports.cash_income')}
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                {t('reports.pos_income')}
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                {t('reports.total_header')} {t('income.total')}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {monthStat.userBreakdown.filter(user => user.cashIncome > 0 || user.posIncome > 0).map((userStat) => {
                              const totalIncome = userStat.cashIncome + userStat.posIncome;
                              return (
                                <tr key={`income-${userStat.userId}`} className="text-gray-300">
                                  <td className="px-4 py-2 whitespace-nowrap">{userStat.name}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-green-400">
                                    {formatCurrency(userStat.cashIncome)}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-green-400">
                                    {formatCurrency(userStat.posIncome)}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-green-400 font-medium">
                                    {formatCurrency(totalIncome)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* User Expense Breakdown */}
                    <div>
                      <h4 className="text-md font-semibold text-white mb-4">{t('reports.user_breakdown_expenses')}</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-700">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                {t('reports.user')}
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                {t('expense.description')}
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                {t('expense.amount')} (₺)
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                {t('expense.date')}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {expenses.filter(expense => {
                              const expenseDate = new Date(expense.date);
                              expenseDate.setHours(0, 0, 0, 0);
                              
                              const startDate = new Date(dateRange.startDate);
                              startDate.setHours(0, 0, 0, 0);
                              
                              const endDate = new Date(dateRange.endDate);
                              endDate.setHours(23, 59, 59, 999);
                              
                              return expenseDate >= startDate && expenseDate <= endDate;
                            }).map((expense) => (
                              <tr key={expense._id} className="text-gray-300">
                                <td className="px-4 py-2 whitespace-nowrap">{expense.user.name || expense.user.username}</td>
                                <td className="px-4 py-2 capitalize">{expense.description}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-red-400">
                                  {formatCurrency(expense.amount)}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {formatDateForDisplay(expense.date)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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