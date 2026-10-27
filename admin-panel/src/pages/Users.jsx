import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { adminAPI } from '../services/api';
import {
  Users as UsersIcon,
  UserCheck,
  UserX,
  Shield,
  Plus,
  Search,
  Truck,
  UserPlus,
  Trash2,
  X,
  Phone,
  Mail,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);

  // Form for creating delivery partner
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'password123',
  });
  const [creatingPartner, setCreatingPartner] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [filterRole]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ role: filterRole, search: searchQuery });
      if (res.data.success) {
        setUsers(res.data.data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentActive) => {
    try {
      await adminAPI.updateUserStatus(id, !currentActive);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await adminAPI.updateUserRole(id, newRole);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Role change failed');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleCreatePartner = async (e) => {
    e.preventDefault();
    setCreatingPartner(true);
    try {
      const res = await adminAPI.createDeliveryPartner(partnerForm);
      if (res.data.success) {
        alert('Delivery Partner created successfully!');
        setShowAddPartnerModal(false);
        setPartnerForm({ name: '', email: '', phone: '', password: 'password123' });
        loadUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Creation failed');
    } finally {
      setCreatingPartner(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q);
  });

  const totalCustomers = users.filter((u) => u.role === 'CUSTOMER').length;
  const totalPartners = users.filter((u) => u.role === 'DELIVERY_PARTNER').length;
  const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header
        title="User Management & Fleet Authorization"
        subtitle="Manage customer profiles, delivery partner fleets, role assignments & platform access"
        onRefresh={loadUsers}
      />

      <main className="p-6 space-y-6">
        {/* User Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Users</span>
            <h3 className="text-2xl font-black text-slate-900">{users.length}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Customers</span>
            <h3 className="text-2xl font-black text-blue-950">{totalCustomers}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Delivery Fleet</span>
            <h3 className="text-2xl font-black text-amber-950">{totalPartners}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">System Admins</span>
            <h3 className="text-2xl font-black text-purple-950">{totalAdmins}</h3>
          </div>
        </div>

        {/* Action & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {[
              { key: '', label: 'All Users' },
              { key: 'CUSTOMER', label: 'Customers' },
              { key: 'DELIVERY_PARTNER', label: 'Delivery Fleet' },
              { key: 'ADMIN', label: 'Admins' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterRole(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterRole === tab.key
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 flex-1 max-w-md justify-end">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>

            <button
              onClick={() => setShowAddPartnerModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shadow-xs whitespace-nowrap transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Delivery Partner</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">User & Contact</th>
                <th className="p-3">Platform Role</th>
                <th className="p-3">Activity / Stats</th>
                <th className="p-3">Account Status</th>
                <th className="p-3 text-right">Admin Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No users match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            u.profileImage ||
                            (u.role === 'DELIVERY_PARTNER'
                              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80')
                          }
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{u.name}</span>
                          <span className="text-[11px] text-slate-500 font-mono block">{u.email}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{u.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : u.role === 'DELIVERY_PARTNER'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="DELIVERY_PARTNER">DELIVERY_PARTNER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">
                      {u.role === 'CUSTOMER' ? (
                        <span>{u.orderCount || 0} order(s) placed</span>
                      ) : u.role === 'DELIVERY_PARTNER' ? (
                        <span>
                          {u.deliveriesCompleted || 0} delivered • {u.activeDeliveries || 0} active
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">Superadmin privileges</span>
                      )}
                    </td>
                    <td className="p-3">
                      {u.isActive ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center">
                          <UserX className="w-3 h-3 mr-1 text-red-600" />
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(u._id, u.isActive)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition ${
                          u.isActive
                            ? 'border-red-200 text-red-700 hover:bg-red-50'
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        title="Delete user account"
                        className="p-1.5 bg-slate-100 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition inline-flex"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add Delivery Partner Modal */}
      {showAddPartnerModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Register New Delivery Partner</h3>
                <p className="text-xs text-slate-500">Add credentials for rider onboarding</p>
              </div>
              <button onClick={() => setShowAddPartnerModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Partner Full Name</label>
                <input
                  type="text"
                  required
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-50 border p-2.5 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={partnerForm.email}
                  onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                  placeholder="e.g. ramesh@pantrypal.com"
                  className="w-full bg-slate-50 border p-2.5 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={partnerForm.phone}
                  onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border p-2.5 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={partnerForm.password}
                  onChange={(e) => setPartnerForm({ ...partnerForm, password: e.target.value })}
                  placeholder="password123"
                  className="w-full bg-slate-50 border p-2.5 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddPartnerModal(false)}
                  className="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingPartner}
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-xs"
                >
                  {creatingPartner ? 'Creating...' : 'Register Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
