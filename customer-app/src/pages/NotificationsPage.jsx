import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { notificationAPI } from '../services/api';
import { Bell, CheckCheck, ShieldAlert, Truck, Tag, ShoppingBag, CreditCard } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAll = async () => {
    try {
      await notificationAPI.markAllRead();
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    if (type === 'EXPIRY') return <ShieldAlert className="w-5 h-5 text-amber-500" />;
    if (type === 'ORDER') return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
    if (type === 'DELIVERY') return <Truck className="w-5 h-5 text-purple-600" />;
    if (type === 'PAYMENT') return <CreditCard className="w-5 h-5 text-indigo-600" />;
    return <Tag className="w-5 h-5 text-rose-500" />;
  };

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50">
      <Navbar />

      <div className="px-4 py-4 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="font-extrabold text-base text-gray-900 flex items-center">
            <Bell className="w-5 h-5 text-emerald-600 mr-2" />
            Notifications
          </h1>
          <button
            onClick={handleMarkAll}
            className="text-xs font-bold text-emerald-600 flex items-center hover:underline"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1" />
            Mark all read
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white h-16 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 p-4">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">No Notifications</h3>
            <p className="text-xs text-gray-500 mt-1">Order updates and expiry alerts will appear here!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`p-3 rounded-2xl border transition flex items-start space-x-3 ${
                  n.isRead ? 'bg-white border-gray-100' : 'bg-emerald-50/50 border-emerald-200'
                }`}
              >
                <div className="p-2 bg-white rounded-xl shadow-xs border border-gray-100 flex-shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-xs">{n.title}</h4>
                  <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
