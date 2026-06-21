import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useToast } from '../../components/Toast';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const { notify } = useToast();
  
  const [oldLoginPassword, setOldLoginPassword] = useState('');
  const [newLoginPassword, setNewLoginPassword] = useState('');
  const [confirmLoginPassword, setConfirmLoginPassword] = useState('');
  const [updatingLoginPassword, setUpdatingLoginPassword] = useState(false);
  
  const [oldDeletionPassword, setOldDeletionPassword] = useState('');
  const [newDeletionPassword, setNewDeletionPassword] = useState('');
  const [confirmDeletionPassword, setConfirmDeletionPassword] = useState('');
  const [updatingDeletionPassword, setUpdatingDeletionPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/admin/settings');
      setSettings(data);
    } catch (e) {
      setError('Could not load settings.');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (key, value) => {
    setUpdating(true);
    try {
      const updatedSettings = { ...settings, [key]: value };
      const { data } = await api.put('/api/admin/settings', updatedSettings);
      setSettings(data);
      notify('Settings updated successfully!', 'success');
    } catch (e) {
      notify('Failed to update settings', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateLoginPassword = async (e) => {
    e.preventDefault();
    if (!oldLoginPassword || !newLoginPassword || !confirmLoginPassword) {
      notify('Please fill all fields', 'error');
      return;
    }
    if (newLoginPassword !== confirmLoginPassword) {
      notify('Passwords do not match', 'error');
      return;
    }
    if (newLoginPassword.length < 6) {
      notify('Password must be at least 6 characters', 'error');
      return;
    }

    setUpdatingLoginPassword(true);
    try {
      await api.put('/api/admin/change-password', { oldPassword: oldLoginPassword, newPassword: newLoginPassword });
      notify('Login password updated successfully!', 'success');
      setOldLoginPassword('');
      setNewLoginPassword('');
      setConfirmLoginPassword('');
    } catch (e) {
      notify(e?.response?.data?.error || 'Failed to update login password', 'error');
    } finally {
      setUpdatingLoginPassword(false);
    }
  };

  const handleUpdateDeletionPassword = async (e) => {
    e.preventDefault();
    if (!oldDeletionPassword || !newDeletionPassword || !confirmDeletionPassword) {
      notify('Please fill all fields', 'error');
      return;
    }
    if (newDeletionPassword !== confirmDeletionPassword) {
      notify('Passwords do not match', 'error');
      return;
    }
    if (newDeletionPassword.length < 6) {
      notify('Password must be at least 6 characters', 'error');
      return;
    }

    setUpdatingDeletionPassword(true);
    try {
      await api.put('/api/admin/deletion-password', { oldPassword: oldDeletionPassword, newPassword: newDeletionPassword });
      notify('Deletion password updated successfully!', 'success');
      setOldDeletionPassword('');
      setNewDeletionPassword('');
      setConfirmDeletionPassword('');
    } catch (e) {
      notify(e?.response?.data?.error || 'Failed to update deletion password', 'error');
    } finally {
      setUpdatingDeletionPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-violet-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
          <p className="text-violet-500 text-lg mb-4">{error}</p>
          <button 
            onClick={loadSettings}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-violet-900 mb-2">Settings</h1>
          <p className="text-violet-600">Manage your store configuration, security, and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-violet-100 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4">
              <h2 className="text-lg font-bold text-white">Company Information</h2>
              <p className="text-violet-100 text-sm">Your business details</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-violet-800 mb-2">Company Name</label>
                <input
                  type="text"
                  value={settings.companyName || ''}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  onBlur={(e) => updateSettings('companyName', e.target.value)}
                  className="w-full bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-violet-900 font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-violet-800 mb-2">GSTIN</label>
                <input
                  type="text"
                  value={settings.companyGst || ''}
                  onChange={(e) => setSettings({ ...settings, companyGst: e.target.value })}
                  onBlur={(e) => updateSettings('companyGst', e.target.value)}
                  className="w-full bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-violet-900 font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-violet-800 mb-2">Company Address</label>
                <textarea
                  value={settings.companyAddress || ''}
                  onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                  onBlur={(e) => updateSettings('companyAddress', e.target.value)}
                  rows={3}
                  className="w-full bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-violet-900 font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-violet-800 mb-2">Phone</label>
                  <input
                    type="text"
                    value={settings.companyPhone || ''}
                    onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                    onBlur={(e) => updateSettings('companyPhone', e.target.value)}
                    className="w-full bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-violet-900 font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-violet-800 mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.companyEmail || ''}
                    onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                    onBlur={(e) => updateSettings('companyEmail', e.target.value)}
                    className="w-full bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-violet-900 font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Store Settings Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-violet-100 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4">
              <h2 className="text-lg font-bold text-white">Store Settings</h2>
              <p className="text-violet-100 text-sm">Order and inventory configuration</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-violet-800 mb-2">Low Stock Threshold</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={settings.lowStockThreshold || 5}
                    onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
                    onBlur={(e) => updateSettings('lowStockThreshold', Number(e.target.value))}
                    className="flex-1 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-violet-900 font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                  />
                  <span className="text-violet-600 text-sm">units</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-violet-800 mb-2">Minimum Order Amount (₹)</label>
                <div className="flex items-center gap-3">
                  <span className="text-violet-600 font-bold text-lg">₹</span>
                  <input
                    type="number"
                    value={settings.minimumOrderAmount || 5000}
                    onChange={(e) => setSettings({ ...settings, minimumOrderAmount: Number(e.target.value) })}
                    onBlur={(e) => updateSettings('minimumOrderAmount', Number(e.target.value))}
                    className="flex-1 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-violet-900 font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-violet-800 mb-2">Tax Rate (%)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={settings.taxRate || 18}
                      onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                      onBlur={(e) => updateSettings('taxRate', Number(e.target.value))}
                      className="flex-1 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-violet-900 font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                    />
                    <span className="text-violet-600 text-sm">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-violet-800 mb-2">Shipping Fee (₹)</label>
                  <div className="flex items-center gap-3">
                    <span className="text-violet-600 font-bold text-lg">₹</span>
                    <input
                      type="number"
                      value={settings.shippingFee || 0}
                      onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })}
                      onBlur={(e) => updateSettings('shippingFee', Number(e.target.value))}
                      className="flex-1 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-violet-900 font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-violet-50 rounded-xl border border-violet-200">
                <div>
                  <p className="font-semibold text-violet-800">Birthday Wishes</p>
                  <p className="text-sm text-violet-600">Automated birthday emails to customers</p>
                </div>
                <button
                  onClick={() => updateSettings('enableBirthdayWishes', !settings.enableBirthdayWishes)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableBirthdayWishes ? 'bg-violet-500' : 'bg-violet-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.enableBirthdayWishes ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-violet-50 rounded-xl border border-violet-200">
                <div>
                  <p className="font-semibold text-violet-800">Order Notifications</p>
                  <p className="text-sm text-violet-600">Notify admin of new orders</p>
                </div>
                <button
                  onClick={() => updateSettings('enableOrderNotifications', !settings.enableOrderNotifications)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableOrderNotifications ? 'bg-violet-500' : 'bg-violet-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.enableOrderNotifications ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Support Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-violet-100 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4">
              <h2 className="text-lg font-bold text-white">Support Information</h2>
              <p className="text-violet-100 text-sm">Customer support contacts</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-violet-800 mb-2">Support Phone</label>
                <input
                  type="text"
                  value={settings.supportPhone || ''}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  onBlur={(e) => updateSettings('supportPhone', e.target.value)}
                  className="w-full bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-violet-900 font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-violet-800 mb-2">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail || ''}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  onBlur={(e) => updateSettings('supportEmail', e.target.value)}
                  className="w-full bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-violet-900 font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-violet-800 mb-2">Return Policy</label>
                <textarea
                  value={settings.returnPolicy || ''}
                  onChange={(e) => setSettings({ ...settings, returnPolicy: e.target.value })}
                  onBlur={(e) => updateSettings('returnPolicy', e.target.value)}
                  rows={4}
                  className="w-full bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-violet-900 font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Security Settings Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-violet-100 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4">
              <h2 className="text-lg font-bold text-white">Security Settings</h2>
              <p className="text-violet-100 text-sm">Password management</p>
            </div>
            <div className="p-6 space-y-6">
              <form onSubmit={handleUpdateLoginPassword} className="space-y-4">
                <div>
                  <h3 className="font-bold text-violet-800 mb-3">Change Login Password</h3>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-violet-800 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={oldLoginPassword}
                    onChange={(e) => setOldLoginPassword(e.target.value)}
                    className="w-full bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-violet-900 font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-violet-800 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newLoginPassword}
                    onChange={(e) => setNewLoginPassword(e.target.value)}
                    className="w-full bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-violet-900 font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-violet-800 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmLoginPassword}
                    onChange={(e) => setConfirmLoginPassword(e.target.value)}
                    className="w-full bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-violet-900 font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={updatingLoginPassword}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-xl font-bold text-sm hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingLoginPassword ? 'Updating...' : 'Update Login Password'}
                </button>
              </form>

              <div className="border-t border-violet-200 pt-6">
                <form onSubmit={handleUpdateDeletionPassword} className="space-y-4">
                  <div>
                    <h3 className="font-bold text-violet-800 mb-3">Change Deletion Password</h3>
                    <p className="text-sm text-violet-600 mb-4">Required before deleting orders, customers, or products</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-violet-800 mb-2">Current Deletion Password</label>
                    <input
                      type="password"
                      value={oldDeletionPassword}
                      onChange={(e) => setOldDeletionPassword(e.target.value)}
                      className="w-full bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-violet-900 font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-violet-800 mb-2">New Deletion Password</label>
                    <input
                      type="password"
                      value={newDeletionPassword}
                      onChange={(e) => setNewDeletionPassword(e.target.value)}
                      className="w-full bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-violet-900 font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-violet-800 mb-2">Confirm New Deletion Password</label>
                    <input
                      type="password"
                      value={confirmDeletionPassword}
                      onChange={(e) => setConfirmDeletionPassword(e.target.value)}
                      className="w-full bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-violet-900 font-medium focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updatingDeletionPassword}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-xl font-bold text-sm hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingDeletionPassword ? 'Updating...' : 'Update Deletion Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
