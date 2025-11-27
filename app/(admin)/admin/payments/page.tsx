'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: string;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  isFake: boolean;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
  paymentMethod: {
    name: string;
    type: string;
  } | null;
}

interface PaymentStatistics {
  totalPayments: number;
  completedPayments: number;
  failedPayments: number;
  fakePayments: number;
  totalRevenue: string;
  fakeTestRevenue: string;
}

interface FakePaymentForm {
  userId: string;
  courseId: string;
  amount: string;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'>('all');
  const [filterFake, setFilterFake] = useState<'all' | 'real' | 'fake'>('all');
  const [showTestPaymentModal, setShowTestPaymentModal] = useState(false);
  const [testPaymentForm, setTestPaymentForm] = useState<FakePaymentForm>({
    userId: '',
    courseId: '',
    amount: '0',
    currency: 'USD',
    status: 'COMPLETED',
  });
  const [testPaymentLoading, setTestPaymentLoading] = useState(false);
  const [testPaymentMessage, setTestPaymentMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchPayments();
    fetchStatistics();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/admin/payments?stats=true');
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleCreateTestPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestPaymentLoading(true);
    setTestPaymentMessage(null);

    try {
      const response = await fetch('/api/admin/payments/test-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: testPaymentForm.userId,
          courseId: testPaymentForm.courseId,
          amount: parseFloat(testPaymentForm.amount),
          currency: testPaymentForm.currency,
          status: testPaymentForm.status,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestPaymentMessage({
          type: 'success',
          text: data.message,
        });
        setTestPaymentForm({
          userId: '',
          courseId: '',
          amount: '0',
          currency: 'USD',
          status: 'COMPLETED',
        });
        setTimeout(() => {
          fetchPayments();
          fetchStatistics();
          setShowTestPaymentModal(false);
        }, 2000);
      } else {
        setTestPaymentMessage({
          type: 'error',
          text: data.error || 'Failed to create test payment',
        });
      }
    } catch (error) {
      setTestPaymentMessage({
        type: 'error',
        text: 'An error occurred while creating test payment',
      });
    } finally {
      setTestPaymentLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    let match = true;

    if (searchQuery) {
      match =
        match &&
        (payment.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.courseId.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (filterStatus !== 'all') {
      match = match && payment.status === filterStatus;
    }

    if (filterFake !== 'all') {
      match = match && (filterFake === 'fake' ? payment.isFake : !payment.isFake);
    }

    return match;
  });

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Payment Management</h1>
          <p className="text-muted-foreground">
            View all payments and manage payment methods
          </p>
        </div>
        <Button
          onClick={() => setShowTestPaymentModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          ➕ Create Test Payment
        </Button>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{statistics.totalPayments}</div>
              <div className="text-xs text-muted-foreground">Total Payments</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">${Number(statistics.totalRevenue).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Real Revenue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{statistics.completedPayments}</div>
              <div className="text-xs text-muted-foreground">Completed Payments</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by user name, email, or course ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="dark:bg-gray-700"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <select
            value={filterFake}
            onChange={(e) => setFilterFake(e.target.value as any)}
            className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="all">All Payments</option>
            <option value="real">Real Payments Only</option>
            <option value="fake">Test Payments Only</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            Showing {filteredPayments.length} of {payments.length} payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">User</th>
                  <th className="text-left py-3 px-4 font-semibold">Course ID</th>
                  <th className="text-right py-3 px-4 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Method</th>
                  <th className="text-left py-3 px-4 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4">
                        <div className="font-medium">{payment.user.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{payment.user.email}</div>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono">{payment.courseId.substring(0, 8)}...</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {payment.currency} {Number(payment.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold $\{statusColors[payment.status]\}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {payment.paymentMethod ? payment.paymentMethod.name : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        {payment.isFake ? (
                          <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                            🧪 Test
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">Real</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Test Payment Modal */}
      {showTestPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Create Test Payment</CardTitle>
              <CardDescription>
                Create a fake payment for testing purposes. This will automatically enroll the user if marked as COMPLETED.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTestPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">User ID *</label>
                  <Input
                    value={testPaymentForm.userId}
                    onChange={(e) =>
                      setTestPaymentForm({ ...testPaymentForm, userId: e.target.value })
                    }
                    placeholder="Enter user ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Course ID *</label>
                  <Input
                    value={testPaymentForm.courseId}
                    onChange={(e) =>
                      setTestPaymentForm({ ...testPaymentForm, courseId: e.target.value })
                    }
                    placeholder="Enter course ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={testPaymentForm.amount}
                    onChange={(e) =>
                      setTestPaymentForm({ ...testPaymentForm, amount: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Currency</label>
                    <select
                      value={testPaymentForm.currency}
                      onChange={(e) =>
                        setTestPaymentForm({
                          ...testPaymentForm,
                          currency: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={testPaymentForm.status}
                      onChange={(e) =>
                        setTestPaymentForm({
                          ...testPaymentForm,
                          status: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="COMPLETED">Completed</option>
                      <option value="PENDING">Pending</option>
                      <option value="FAILED">Failed</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                  </div>
                </div>

                {testPaymentMessage && (
                  <div
                    className={`p-3 rounded-md text-sm $\{
                      testPaymentMessage.type === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    \}`}
                  >
                    {testPaymentMessage.text}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={testPaymentLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {testPaymentLoading ? 'Creating...' : 'Create Payment'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowTestPaymentModal(false)}
                    variant="outline"
                    disabled={testPaymentLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
