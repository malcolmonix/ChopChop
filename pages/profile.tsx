import { withAuth } from '@/lib/components/protected-route';
import { useFirebaseAuth } from '@/lib/context/firebase-auth.context';
import { useFormValidation, commonValidations } from '@/lib/utils/validation';
import { useToast } from '@/lib/context/toast.context';
import { LoadingButton } from '@/lib/components/loading';
import { ProfileAddressManager } from '../lib/components/profile-address-manager';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

function ProfilePage() {
  const { user, signOut } = useFirebaseAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');

  const form = useFormValidation(
    {
      name: user?.displayName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
    },
    {
      name: commonValidations.name,
      email: commonValidations.email,
      phone: commonValidations.phone,
    }
  );

  const handleSave = async () => {
    if (!form.validateAll()) {
      showToast('error', 'Please fix form errors');
      return;
    }

    setIsSaving(true);

    try {
      // TODO: Add update profile mutation
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      showToast('success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      showToast('error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden mb-6 border border-orange-100">
            <div className="relative h-32 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600">
              {/* Food pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80"
                  alt="Food pattern"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="px-6 py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative -mt-16">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-600 p-1 shadow-xl">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      {user?.displayName || 'Food Lover'}
                    </h1>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <span>📧</span>
                      {user?.email || 'No email'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    href="/"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all shadow-sm"
                  >
                    🏠 Home
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  👤 Profile Info
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'addresses'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📍 Delivery Addresses
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'orders'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📦 Order History
                </button>
              </nav>
            </div>
          </div>

          {/* Profile Info Card */}
          {activeTab === 'profile' && (
          <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden border border-orange-100">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

              <div className="space-y-6">
              {/* Profile Fields */}
              <div className="grid gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">👤</span>
                    </div>
                    <input
                      type="text"
                      value={form.values.name}
                      onChange={(e) => form.handleChange('name', e.target.value)}
                      onBlur={() => form.handleBlur('name')}
                      className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                    {form.touched.name && form.errors.name && (
                      <p className="mt-1 text-sm text-red-600">{form.errors.name}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl font-medium">{user?.displayName || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                {isEditing ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">📧</span>
                    </div>
                    <input
                      type="email"
                      value={form.values.email}
                      onChange={(e) => form.handleChange('email', e.target.value)}
                      onBlur={() => form.handleBlur('email')}
                      className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                    {form.touched.email && form.errors.email && (
                      <p className="mt-1 text-sm text-red-600">{form.errors.email}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl font-medium">{user?.email || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                {isEditing ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">📱</span>
                    </div>
                    <input
                      type="tel"
                      value={form.values.phone}
                      onChange={(e) => form.handleChange('phone', e.target.value)}
                      onBlur={() => form.handleBlur('phone')}
                      className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                    {form.touched.phone && form.errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{form.errors.phone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl font-medium">{user?.phoneNumber || 'Not provided'}</p>
                )}
              </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                {isEditing ? (
                  <>
                    <LoadingButton
                      loading={isSaving}
                      onClick={handleSave}
                      disabled={!form.isValid || isSaving}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium"
                    >
                      💾 Save Changes
                    </LoadingButton>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        form.reset();
                      }}
                      disabled={isSaving}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 disabled:opacity-50 transition-all font-medium"
                    >
                      Cancel
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
          )}

          {/* Address Management Section */}
          {activeTab === 'addresses' && (
            <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden border border-orange-100">
              <div className="px-6 py-5 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  📍 Delivery Addresses
                </h2>
              </div>
              <div className="p-6">
                <ProfileAddressManager />
              </div>
            </div>
          )}

          {/* Orders Section */}
          {activeTab === 'orders' && (
        <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden border border-orange-100">
          <div className="px-6 py-5 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>🍱</span> Recent Orders
            </h2>
          </div>
          <div className="px-6 py-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">🛒</span>
              </div>
              <p className="text-gray-600 mb-6">No orders yet. Start exploring delicious meals!</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-medium"
              >
                🍔 Start Shopping
              </Link>
            </div>
          </div>
        </div>
          )}
      </div>
    </div>
    </div>
  );
}

export default withAuth(ProfilePage);
