'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

interface IncomeEntry {
  _id: string;
  date: string;
  cashIncome: number;
  posIncome: number;
  createdAt: string;
  user?: {
    _id: string;
    name?: string;
    username: string;
  } | string;
}

interface ExpenseEntry {
  _id: string;
  date: string;
  description: string;
  amount: number;
  createdAt: string;
  user?: {
    _id: string;
    name?: string;
    username: string;
  } | string;
}

export default function EmployeeDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Income states
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [loadingIncome, setLoadingIncome] = useState(true);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | null>(null);
  const [incomeFormData, setIncomeFormData] = useState({
    date: formatDateForInput(new Date()),
    cashIncome: '',
    posIncome: ''
  });

  // Expense states
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);
  const [expenseFormData, setExpenseFormData] = useState({
    date: formatDateForInput(new Date()),
    description: '',
    amount: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    fetchEntries();
    fetchExpenses();
  }, []);

  const fetchEntries = useCallback(async () => {
    try {
      const response = await fetch('/api/income');
      if (response.ok) {
        const data = await response.json();
        // Filter to show only current user's entries
        const userEntries = data.entries.filter((entry: IncomeEntry) => {
          if (typeof entry.user === 'string') {
            return entry.user === user?.id;
          }
          return entry.user?._id === user?.id;
        });
        setEntries(userEntries);
      }
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoadingIncome(false);
    }
  }, [user?.id]);

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await fetch('/api/expenses');
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoadingExpenses(false);
    }
  }, []);

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingEntry ? `/api/income/${editingEntry._id}` : '/api/income';
      const method = editingEntry ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: incomeFormData.date,
          cashIncome: parseInt(incomeFormData.cashIncome) || 0,
          posIncome: parseInt(incomeFormData.posIncome) || 0
        }),
      });

      if (response.ok) {
        await fetchEntries();
        setShowIncomeForm(false);
        setEditingEntry(null);
        setIncomeFormData({
          date: formatDateForInput(new Date()),
          cashIncome: '',
          posIncome: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save entry');
      }
    } catch (error) {
      setError('Failed to save entry');
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!expenseFormData.description.trim()) {
      setError('Expense description is required');
      return;
    }

    try {
      const url = editingExpense ? `/api/expenses/${editingExpense._id}` : '/api/expenses';
      const method = editingExpense ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: expenseFormData.date,
          description: expenseFormData.description,
          amount: parseInt(expenseFormData.amount) || 0
        }),
      });

      if (response.ok) {
        await fetchExpenses();
        setShowExpenseForm(false);
        setEditingExpense(null);
        setExpenseFormData({
          date: formatDateForInput(new Date()),
          description: '',
          amount: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save expense');
      }
    } catch (error) {
      setError('Failed to save expense');
    }
  };

  const handleIncomeEdit = (entry: IncomeEntry) => {
    setEditingEntry(entry);
    setIncomeFormData({
      date: new Date(entry.date).toISOString().split('T')[0],
      cashIncome: entry.cashIncome.toString(),
      posIncome: entry.posIncome.toString()
    });
    setShowIncomeForm(true);
  };

  const handleExpenseEdit = (expense: ExpenseEntry) => {
    setEditingExpense(expense);
    setExpenseFormData({
      date: new Date(expense.date).toISOString().split('T')[0],
      description: expense.description,
      amount: expense.amount.toString()
    });
    setShowExpenseForm(true);
  };

  const handleIncomeDelete = async (id: string) => {
    if (confirm(t('confirmDelete'))) {
      try {
        const response = await fetch(`/api/income/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchEntries();
        }
      } catch (error) {
        console.error('Failed to delete entry:', error);
      }
    }
  };

  const handleExpenseDelete = async (id: string) => {
    if (confirm(t('confirmDelete'))) {
      try {
        const response = await fetch(`/api/expenses/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchExpenses();
        }
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const handleIncomeInputChange = (field: string, value: string) => {
    if (field === 'cashIncome' || field === 'posIncome') {
      // Only allow whole numbers
      if (value === '' || /^\d+$/.test(value)) {
        setIncomeFormData(prev => ({ ...prev, [field]: value }));
      }
    } else {
      setIncomeFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleExpenseInputChange = (field: string, value: string) => {
    if (field === 'amount') {
      // Only allow whole numbers
      if (value === '' || /^\d+$/.test(value)) {
        setExpenseFormData(prev => ({ ...prev, [field]: value }));
      }
    } else {
      setExpenseFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleIncomeKeyDown = (e: React.KeyboardEvent) => {
    // Prevent decimal point, minus sign, and 'e'
    if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loadingIncome || loadingExpenses) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <div className="text-white mt-4">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Income Management Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{t('income.management')}</h2>
            <button
              onClick={() => setShowIncomeForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {t('income.add_button')}
            </button>
          </div>

          {/* Income Form */}
          {showIncomeForm && (
            <div className="bg-gray-700 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                {editingEntry ? t('income.edit_entry') : t('income.add_entry')}
              </h3>
              
              {error && (
                <div className="bg-red-500 text-white p-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleIncomeSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">{t('date')}</label>
                  <input
                    type="date"
                    value={incomeFormData.date}
                    onChange={(e) => handleIncomeInputChange('date', e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">{t('income.cash')} (₺)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={incomeFormData.cashIncome}
                      onChange={(e) => handleIncomeInputChange('cashIncome', e.target.value)}
                      onKeyDown={handleIncomeKeyDown}
                      className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">{t('income.pos')} (₺)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={incomeFormData.posIncome}
                      onChange={(e) => handleIncomeInputChange('posIncome', e.target.value)}
                      onKeyDown={handleIncomeKeyDown}
                      className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {editingEntry ? t('income.update_entry') : t('income.add_button')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowIncomeForm(false);
                      setEditingEntry(null);
                      setIncomeFormData({
                        date: formatDateForInput(new Date()),
                        cashIncome: '',
                        posIncome: ''
                      });
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {t('income.cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Income Entries Table */}
          <div className="bg-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-white font-medium">{t('income.date')}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{t('income.cash')}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{t('income.pos')}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{t('income.total')}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{t('income.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                                             <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                         {t('income.no_entries')}
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr key={entry._id} className="border-t border-gray-600">
                        <td className="px-4 py-3 text-gray-300">{formatDate(entry.date)}</td>
                        <td className="px-4 py-3 text-gray-300">{formatCurrency(entry.cashIncome)}</td>
                        <td className="px-4 py-3 text-gray-300">{formatCurrency(entry.posIncome)}</td>
                        <td className="px-4 py-3 text-gray-300 font-medium">
                          {formatCurrency(entry.cashIncome + entry.posIncome)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleIncomeEdit(entry)}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              {t('income.edit')}
                            </button>
                            <button
                              onClick={() => handleIncomeDelete(entry._id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              {t('income.delete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Expense Management Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{t('expense.management')}</h2>
            <button
              onClick={() => setShowExpenseForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {t('expense.add_button')}
            </button>
          </div>

          {/* Expense Form */}
          {showExpenseForm && (
            <div className="bg-gray-700 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                {editingExpense ? t('expense.edit_button') : t('expense.add_button')}
              </h3>
              
              {error && (
                <div className="bg-red-500 text-white p-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">{t('expense.date')}</label>
                  <input
                    type="date"
                    value={expenseFormData.date}
                    onChange={(e) => handleExpenseInputChange('date', e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">{t('expense.description')}</label>
                  <input
                    type="text"
                    value={expenseFormData.description}
                    onChange={(e) => handleExpenseInputChange('description', e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:border-blue-500 focus:outline-none"
                    placeholder={t('expense.description_placeholder')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">{t('expense.amount')} (₺)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={expenseFormData.amount}
                    onChange={(e) => handleExpenseInputChange('amount', e.target.value)}
                    onKeyDown={handleIncomeKeyDown}
                    className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:border-blue-500 focus:outline-none"
                    placeholder="0"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {editingExpense ? t('expense.update') : t('expense.add_button')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExpenseForm(false);
                      setEditingExpense(null);
                      setExpenseFormData({
                        date: formatDateForInput(new Date()),
                        description: '',
                        amount: ''
                      });
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {t('expense.cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Expense Entries Table */}
          <div className="bg-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-white font-medium">{t('expense.date')}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{t('expense.description')}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{t('expense.amount')}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{t('expense.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    {t('expense.no_expenses')}
                    </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense._id} className="border-t border-gray-600">
                        <td className="px-4 py-3 text-gray-300">{formatDate(expense.date)}</td>
                        <td className="px-4 py-3 text-gray-300 capitalize">{expense.description}</td>
                        <td className="px-4 py-3 text-gray-300">{formatCurrency(expense.amount)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleExpenseEdit(expense)}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              {t('expense.edit')}
                            </button>
                            <button
                              onClick={() => handleExpenseDelete(expense._id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              {t('expense.delete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 