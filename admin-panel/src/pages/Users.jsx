import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { adminAPI } from '../services/api';
import { Users as UsersIcon, UserCheck, UserX, Shield } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    loadUsers();
  }, [filterRole]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ role: filterRole });
      if (res.data.success) {
        setUsers(res.data.data.users);
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

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header title="User Management & Role Control" />

      <main className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-extrabold text-lg text-slate-900">Platform Users ({users.length})</h2>
            <p className="text-xs text-slate-500">Manage customer & delivery partner accounts</p>
          </div>

          <div className="flex items-center space-x-2">
            {['', 'CUSTOMER', 'DELIVERY_PARTNER', 'ADMIN'].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterRole === role
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {role ? role.replace(/_/g, ' ') : 'All Users'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{u.name}</td>
                  <td className="p-3 text-slate-600">{u.email}</td>
                  <td className="p-3 text-slate-600">{u.phone || 'N/A'}</td>
                  <td className="p-3">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold text-[10px]">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    {u.isActive ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Deactivated
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
