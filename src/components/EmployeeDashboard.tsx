'use client';

import { useState, useEffect, useCallback } from 'react';

import { useAuth } from '@/contexts/AuthContext';

interface IncomeEntry {
  _id: string;
  date: string;
  cashIncome: number;
  posIncome: number;
  lotteryTicketIncome: number;
  lotteryScratchIncome: number;
  lotteryNumericalIncome: number;
  store: {
    _id: string;
    name: string;
  };
  createdAt: string;
  user?: {
    _id: string;
    name?: string;
    username: string;
  } | string;
}

interface Store {
  _id: string;
  name: string;
}

interface ExpenseEntry {
  _id: string;
  date: string;
  type: 'expense' | 'payment';
  description: string;
  amount: number;
  store: {
    _id: string;
    name: string;
  };
  createdAt: string;
  user?: {
    _id: string;
    name?: string;
    username: string;
  } | string;
}

export default function EmployeeDashboard() {

  const { user } = useAuth();
  
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Income states
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingIncome, setLoadingIncome] = useState(true);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | null>(null);
  const [incomeFormData, setIncomeFormData] = useState({
    date: formatDateForInput(new Date()),
    store: '',
    cashIncome: '',
    posIncome: '',
    lotteryTicketIncome: '',
    lotteryScratchIncome: '',
    lotteryNumericalIncome: ''
  });

  // Expense states
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);
  const [expenseFormData, setExpenseFormData] = useState({
    date: formatDateForInput(new Date()),
    store: '',
    type: 'expense' as 'expense' | 'payment',
    description: '',
    amount: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    fetchStores();
    fetchEntries();
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStores = useCallback(async () => {
    try {
      const response = await fetch('/api/stores');
      if (response.ok) {
        const data = await response.json();
        setStores(data.stores);
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
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

    if (!incomeFormData.store) {
      setError('Please select a store');
      return;
    }

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
          store: incomeFormData.store,
          cashIncome: parseInt(incomeFormData.cashIncome) || 0,
          posIncome: parseInt(incomeFormData.posIncome) || 0,
          lotteryTicketIncome: parseInt(incomeFormData.lotteryTicketIncome) || 0,
          lotteryScratchIncome: parseInt(incomeFormData.lotteryScratchIncome) || 0,
          lotteryNumericalIncome: parseInt(incomeFormData.lotteryNumericalIncome) || 0
        }),
      });

      if (response.ok) {
        await fetchEntries();
        setShowIncomeForm(false);
        setEditingEntry(null);
        setIncomeFormData({
          date: formatDateForInput(new Date()),
          store: '',
          cashIncome: '',
          posIncome: '',
          lotteryTicketIncome: '',
          lotteryScratchIncome: '',
          lotteryNumericalIncome: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save entry');
      }
    } catch {
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

    if (!expenseFormData.store) {
      setError('Please select a store');
      return;
    }

    if (!expenseFormData.type) {
      setError('Please select expense type');
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
          store: expenseFormData.store,
          type: expenseFormData.type,
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
          store: '',
          type: 'expense' as 'expense' | 'payment',
          description: '',
          amount: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save expense');
      }
    } catch {
      setError('Failed to save expense');
    }
  };

  const handleIncomeEdit = (entry: IncomeEntry) => {
    setEditingEntry(entry);
    setIncomeFormData({
      date: new Date(entry.date).toISOString().split('T')[0],
      store: entry.store._id,
      cashIncome: entry.cashIncome.toString(),
      posIncome: entry.posIncome.toString(),
      lotteryTicketIncome: entry.lotteryTicketIncome.toString(),
      lotteryScratchIncome: entry.lotteryScratchIncome.toString(),
      lotteryNumericalIncome: entry.lotteryNumericalIncome.toString()
    });
    setShowIncomeForm(true);
  };

  const handleExpenseEdit = (expense: ExpenseEntry) => {
    setEditingExpense(expense);
    setExpenseFormData({
      date: new Date(expense.date).toISOString().split('T')[0],
      store: expense.store._id,
      type: expense.type,
      description: expense.description,
      amount: expense.amount.toString()
    });
    setShowExpenseForm(true);
  };

  const handleIncomeDelete = async (id: string) => {
    if (confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
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
    if (confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
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
    if (field === 'cashIncome' || field === 'posIncome' || field === 'lotteryTicketIncome' || field === 'lotteryScratchIncome' || field === 'lotteryNumericalIncome') {
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
        <div className="text-white mt-4">{'Yükleniyor...'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Income Management Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{'Gelir Yönetimi'}</h2>
            <button
              onClick={() => setShowIncomeForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {'Gelir Ekle'}
            </button>
          </div>

          {/* Income Form */}
          {showIncomeForm && (
            <div className="bg-gray-700 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                {editingEntry ? 'Gelir Düzenle' : 'Gelir Ekle'}
              </h3>
              
              {error && (
                <div className="bg-red-500 text-white p-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleIncomeSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">{'Tarih'}</label>
                  <input
                    type="date"
                    value={incomeFormData.date}
                    onChange={(e) => handleIncomeInputChange('date', e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">{'Mağaza'}</label>
                  <select
                    value={incomeFormData.store}
                    onChange={(e) => handleIncomeInputChange('store', e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:border-blue-500 focus:outline-none capitalize"
                    required
                  >
                    <option value="">{'Mağaza Seçin'}</option>
                    {stores.map((store) => (
                      <option key={store._id} value={store._id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">{'Nakit Gelir'} (₺)</label>
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
                    <label className="block text-gray-300 mb-2">{'POS Gelir'} (₺)</label>
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

                  <div>
                    <label className="block text-gray-300 mb-2">{'Amorti (Bilet) Gelir'} (₺)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={incomeFormData.lotteryTicketIncome}
                      onChange={(e) => handleIncomeInputChange('lotteryTicketIncome', e.target.value)}
                      onKeyDown={handleIncomeKeyDown}
                      className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">{'Amorti (Kazıkazan) Gelir'} (₺)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={incomeFormData.lotteryScratchIncome}
                      onChange={(e) => handleIncomeInputChange('lotteryScratchIncome', e.target.value)}
                      onKeyDown={handleIncomeKeyDown}
                      className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">{'Amorti (Sayısal Loto) Gelir'} (₺)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={incomeFormData.lotteryNumericalIncome}
                      onChange={(e) => handleIncomeInputChange('lotteryNumericalIncome', e.target.value)}
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
                    {editingEntry ? 'Gelir Güncelle' : 'Gelir Ekle'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowIncomeForm(false);
                      setEditingEntry(null);
                      setIncomeFormData({
                        date: formatDateForInput(new Date()),
                        store: '',
                        cashIncome: '',
                        posIncome: '',
                        lotteryTicketIncome: '',
                        lotteryScratchIncome: '',
                        lotteryNumericalIncome: ''
                      });
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {'İptal'}
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
                    <th className="px-4 py-3 text-left text-white font-medium">{'Tarih'}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{'Mağaza'}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{'Nakit Gelir'}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{'POS Gelir'}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{'Amorti (Bilet) Gelir'}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{'Amorti (Kazıkazan) Gelir'}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{'Amorti (Sayısal Loto) Gelir'}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{'Toplam'}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{'İşlemler'}</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                        {'Henüz gelir kaydı yok'}
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => {
                      const total = entry.cashIncome + entry.posIncome + entry.lotteryTicketIncome + entry.lotteryScratchIncome + entry.lotteryNumericalIncome;
                      return (
                        <tr key={entry._id} className="border-t border-gray-600">
                          <td className="px-4 py-3 text-gray-300">{formatDate(entry.date)}</td>
                          <td className="px-4 py-3 text-gray-300 capitalize">{entry.store?.name || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-300">{formatCurrency(entry.cashIncome)}</td>
                          <td className="px-4 py-3 text-gray-300">{formatCurrency(entry.posIncome)}</td>
                          <td className="px-4 py-3 text-gray-300">{formatCurrency(entry.lotteryTicketIncome)}</td>
                          <td className="px-4 py-3 text-gray-300">{formatCurrency(entry.lotteryScratchIncome)}</td>
                          <td className="px-4 py-3 text-gray-300">{formatCurrency(entry.lotteryNumericalIncome)}</td>
                          <td className="px-4 py-3 text-gray-300 font-medium">
                            {formatCurrency(total)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleIncomeEdit(entry)}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                {'Düzenle'}
                              </button>
                              <button
                                onClick={() => handleIncomeDelete(entry._id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                {'Sil'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Expense Management Section - Only visible for business users */}
        {user?.role === 'business' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{'Gider Yönetimi'}</h2>
            <button
              onClick={() => setShowExpenseForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {'Gider Ekle'}
            </button>
          </div>

          {/* Expense Form */}
          {showExpenseForm && (
            <div className="bg-gray-700 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                {editingExpense ? 'Gider Düzenle' : 'Gider Ekle'}
              </h3>
              
              {error && (
                <div className="bg-red-500 text-white p-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">{'Tarih'}</label>
                  <input
                    type="date"
                    value={expenseFormData.date}
                    onChange={(e) => handleExpenseInputChange('date', e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">{'Mağaza'}</label>
                  <select
                    value={expenseFormData.store}
                    onChange={(e) => handleExpenseInputChange('store', e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:border-blue-500 focus:outline-none capitalize"
                    required
                  >
                    <option value="">{'Mağaza seçin'}</option>
                    {stores.map((store) => (
                      <option key={store._id} value={store._id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">{'Tür'}</label>
                  <select
                    value={expenseFormData.type}
                    onChange={(e) => handleExpenseInputChange('type', e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">{'Tür seçin'}</option>
                    <option value="expense">{'Harcama'}</option>
                    <option value="payment">{'Ödeme'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">{'Açıklama'}</label>
                  <input
                    type="text"
                    value={expenseFormData.description}
                    onChange={(e) => handleExpenseInputChange('description', e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Gider açıklaması"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">{'Tutar'} (₺)</label>
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
                    {editingExpense ? 'Güncelle' : 'Gider Ekle'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExpenseForm(false);
                      setEditingExpense(null);
                      setExpenseFormData({
                        date: formatDateForInput(new Date()),
                        store: '',
                        type: 'expense' as 'expense' | 'payment',
                        description: '',
                        amount: ''
                      });
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {'İptal'}
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
                    <th className="px-4 py-3 text-left text-white font-medium">{'Tarih'}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{'Mağaza'}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{'Tür'}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{'Açıklama'}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">{'Tutar'}</th>
                    <th className="px-4 py-3 text-left text-white font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        Henüz gider kaydı yok
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense._id} className="border-t border-gray-600">
                        <td className="px-4 py-3 text-gray-300">{formatDate(expense.date)}</td>
                        <td className="px-4 py-3 text-gray-300 capitalize">{expense.store?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-300 capitalize">
                          {expense.type === 'expense' ? 'Harcama' : 'Ödeme'}
                        </td>
                        <td className="px-4 py-3 text-gray-300 capitalize">{expense.description}</td>
                        <td className="px-4 py-3 text-gray-300">{formatCurrency(expense.amount)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleExpenseEdit(expense)}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              {'Düzenle'}
                            </button>
                            <button
                              onClick={() => handleExpenseDelete(expense._id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              {'Sil'}
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
        )}
      </div>
    </div>
  );
} 