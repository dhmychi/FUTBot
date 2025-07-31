import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { LogOut, Plus, Trash2, RefreshCw, Users, UserX, UsersRound, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

interface Subscription {
  id: string;
  email: string;
  secret_code: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface Stats {
  active: number;
  inactive: number;
  total: number;
}

export default function Dashboard() {
  const { signOut } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<Stats>({ active: 0, inactive: 0, total: 0 });
  const [newEmail, setNewEmail] = useState('');
  const [newSecretCode, setNewSecretCode] = useState('');
  const [endDate, setEndDate] = useState('');

  const calculateStats = (subs: Subscription[]) => {
    const active = subs.filter(s => s.is_active).length;
    const inactive = subs.filter(s => !s.is_active).length;
    setStats({
      active,
      inactive,
      total: active + inactive
    });
  };

  const fetchSubscriptions = async () => {
    // تم حذف كود supabase بالكامل. أضف هنا كود KeyAuth أو أي كود مصادقة آخر.
    // const { data, error } = await supabase
    //   .from('subscriptions')
    //   .select('*')
    //   .order('created_at', { ascending: false });

    // if (error) {
    //   toast.error('Failed to fetch subscriptions');
    //   return;
    // }

    // setSubscriptions(data);
    // calculateStats(data);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();

    // تم حذف كود supabase بالكامل. أضف هنا كود KeyAuth أو أي كود مصادقة آخر.
    // const { error } = await supabase.from('subscriptions').insert([
    //   {
    //     email: newEmail,
    //     secret_code: newSecretCode,
    //     end_date: new Date(endDate).toISOString(),
    //   },
    // ]);

    // if (error) {
    //   toast.error('Failed to add subscription');
    //   return;
    // }

    // toast.success('Subscription added successfully');
    // setNewEmail('');
    // setNewSecretCode('');
    // setEndDate('');
    // fetchSubscriptions();
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    // تم حذف كود supabase بالكامل. أضف هنا كود KeyAuth أو أي كود مصادقة آخر.
    // const { error } = await supabase
    //   .from('subscriptions')
    //   .update({ is_active: !currentStatus })
    //   .eq('id', id);

    // if (error) {
    //   toast.error('Failed to update subscription status');
    //   return;
    // }

    // toast.success('Subscription status updated');
    // fetchSubscriptions();
  };

  const handleDelete = async (id: string) => {
    // تم حذف كود supabase بالكامل. أضف هنا كود KeyAuth أو أي كود مصادقة آخر.
    // const { error } = await supabase
    //   .from('subscriptions')
    //   .delete()
    //   .eq('id', id);

    // if (error) {
    //   toast.error('Failed to delete subscription');
    //   return;
    // }

    // toast.success('Subscription deleted');
    // fetchSubscriptions();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-white" />
              <h1 className="ml-3 text-2xl font-bold text-white">FUTBot Manager</h1>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center px-4 py-2 text-sm text-white hover:bg-indigo-700 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Inactive Subscriptions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.inactive}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <UsersRound className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Subscriptions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Subscription Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Subscription</h2>
          <form onSubmit={handleAddSubscription} className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <input
              type="email"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Secret Code"
              value={newSecretCode}
              onChange={(e) => setNewSecretCode(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <button
              type="submit"
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Subscription
            </button>
          </form>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Secret Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscription.secret_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(subscription.start_date), 'PPP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(subscription.end_date), 'PPP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          subscription.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {subscription.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleToggleActive(subscription.id, subscription.is_active)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors"
                        title={subscription.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subscription.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}