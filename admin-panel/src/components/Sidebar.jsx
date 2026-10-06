import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Grid,
  ShoppingBag,
  Boxes,
  Truck,
  Users,
  ShieldAlert,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { logout } = useAuth();

  const links = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Categories', path: '/categories', icon: Grid },
    { label: 'Products & Shelf Life', path: '/products', icon: ShoppingBag },
    { label: 'Inventory Control', path: '/inventory', icon: Boxes },
    { label: 'Orders & Deliveries', path: '/orders', icon: Truck },
    { label: 'User Management', path: '/users', icon: Users },
    { label: 'Expiry & Wastage Reports', path: '/reports', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen p-4 flex flex-col justify-between border-r border-slate-800">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center space-x-3 px-2">
          <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-md">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white leading-tight">
              Pantry<span className="text-emerald-500">Pal</span>
            </h1>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Admin Panel</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-slate-800 transition"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out Admin</span>
      </button>
    </aside>
  );
}
