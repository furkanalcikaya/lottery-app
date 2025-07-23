'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

interface IncomeEntry {
  _id: string;
  date: string;
  cashIncome: number;
  posIncome: number;
  expenses: number;
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

  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | null>(null);
  const [formData, setFormData] = useState({
    date: formatDateForInput(new Date()),
    cashIncome: '',
    posIncome: '',
    expenses: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = useCallback(async () => {
    try {
      const response = await fetch('/api/income');
      if (response.ok) {
        const data = await response.json();
        // Filter entries to show only current user's entries
        const userEntries = data.entries.filter((entry: IncomeEntry) => {
          if (typeof entry.user === 'string') {
            return entry.user === user?.id;
          } else if (entry.user && typeof entry.user === 'object') {
            return entry.user._id === user?.id;
          }
          return false;
        });
        setEntries(userEntries);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = {
      date: formData.date,
      cashIncome: parseInt(formData.cashIncome) || 0,
      posIncome: parseInt(formData.posIncome) || 0,
      expenses: parseInt(formData.expenses) || 0
    };

    try {
      let response;
      
      if (editingEntry) {
        response = await fetch(`/api/income/${editingEntry._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('/api/income', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        fetchEntries();
        setShowForm(false);
        setEditingEntry(null);
        setFormData({
          date: formatDateForInput(new Date()),
          cashIncome: '',
          posIncome: '',
          expenses: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch {
      setError('Failed to save entry');
    }
  };

  const handleEdit = (entry: IncomeEntry) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date.split('T')[0],
      cashIncome: entry.cashIncome.toString(),
      posIncome: entry.posIncome.toString(),
      expenses: entry.expenses.toString()
    });
    setShowForm(true);
  };

  const handleNumberInputChange = (field: 'cashIncome' | 'posIncome' | 'expenses', value: string) => {
    // Only allow digits (whole numbers)
    const numbersOnly = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, [field]: numbersOnly }));
  };


  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await fetch(`/api/income/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchEntries();
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch {
      setError('Failed to delete entry');
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
        <h1 className="text-3xl font-bold text-white">{t('dashboard.employee_title')}</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingEntry(null);
            setFormData({
              date: formatDateForInput(new Date()),
              cashIncome: '',
              posIncome: '',
              expenses: ''
            });
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {t('income.add_button')}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            {editingEntry ? t('income.edit_title') : t('income.add_title')}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('income.date')}
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('income.cash_income')}
                  </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.cashIncome}
                  onChange={(e) => handleNumberInputChange('cashIncome', e.target.value)}
                  onKeyDown={(e) => {
                    // Prevent decimal point, minus sign, and 'e' (scientific notation)
                    if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault();
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('income.pos_income')}
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.posIncome}
                  onChange={(e) => handleNumberInputChange('posIncome', e.target.value)}
                  onKeyDown={(e) => {
                    // Prevent decimal point, minus sign, and 'e' (scientific notation)
                    if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault();
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('income.expenses')}
                  </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.expenses}
                  onChange={(e) => handleNumberInputChange('expenses', e.target.value)}
                  onKeyDown={(e) => {
                    // Prevent decimal point, minus sign, and 'e' (scientific notation)
                    if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault();
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {editingEntry ? t('income.update') : t('income.save')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingEntry(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {t('income.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">{t('income.recent_entries')}</h2>
        </div>
        
        {entries.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            {t('income.no_entries')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('income.date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('income.cash_income')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('income.pos_income')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('income.expenses')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('income.net_profit')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('income.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {entries.map((entry) => {
                  const net = entry.cashIncome + entry.posIncome - entry.expenses;
                  return (
                    <tr key={entry._id} className="text-gray-300">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDateForDisplay(entry.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-400">
                        {formatCurrency(entry.cashIncome)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-400">
                        {formatCurrency(entry.posIncome)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-red-400">
                        {formatCurrency(entry.expenses)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap font-medium ${net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(net)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            {t('income.edit')}
                          </button>
                          <button
                            onClick={() => handleDelete(entry._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            {t('income.delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 