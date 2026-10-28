import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { notificationAPI } from '../services/api';
import {
  Bell,
  CheckCheck,
  ShieldAlert,
  Truck,
  Tag,
  ShoppingBag,
  CreditCard,
  Zap,
  Filter,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [triggering, setTriggering] = useState(false);
  const [testBanner, setTestBanner] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
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

  const handleTriggerTest = async (type) => {
    setTriggering(true);
    try {
      const res = await notificationAPI.triggerTestNotification(type);
      if (res.data.success) {
        setTestBanner(`Test ${type} notification generated & delivered!`);
        setTimeout(() => setTestBanner(null), 4000);
        loadNotifications();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to trigger test notification');
    } finally {
      setTriggering(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ORDER':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-indigo-600" />;
      case 'DELIVERY':
        return <Truck className="w-4 h-4 text-purple-600" />;
      case 'PROMO':
        return <Tag className="w-4 h-4 text-rose-500" />;
      case 'EXPIRY':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const filtered = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  return (
    <div className="pb-28 max-w-md mx-auto min-h-screen bg-gray-50">
      <Navbar />

      <div className="px-4 py-4 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-extrabold text-base text-gray-900 flex items-center">
              <Bell className="w-5 h-5 text-emerald-600 mr-2" />
              Notification Center
              {unreadCount > 0 && (
                <span className="ml-2 bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-[11px] text-gray-500">Order updates, payments, deliveries, discounts & expiry alerts</p>
          </div>
          <button
            onClick={handleMarkAll}
            className="text-xs font-bold text-emerald-600 flex items-center hover:underline whitespace-nowrap"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1" />
            Mark all read
          </button>
        </div>

        {/* Live Test Notification Generator Toolbar */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 p-3.5 rounded-2xl text-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs flex items-center">
              <Zap className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
              Test 5 Notification Modules Live
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">FCM Push Active</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {[
              { type: 'ORDER', label: 'Order', icon: '🛒' },
              { type: 'PAYMENT', label: 'Payment', icon: '💳' },
              { type: 'DELIVERY', label: 'Delivery', icon: '🛵' },
              { type: 'PROMO', label: 'Promo', icon: '🎉' },
              { type: 'EXPIRY', label: 'Expiry', icon: '⏳' },
            ].map((btn) => (
              <button
                key={btn.type}
                onClick={() => handleTriggerTest(btn.type)}
                disabled={triggering}
                className="bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/10 p-2 rounded-xl text-center transition disabled:opacity-50"
              >
                <span className="text-base block">{btn.icon}</span>
                <span className="text-[9px] font-bold block mt-0.5">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Banner Alert */}
        {testBanner && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 animate-fade-in shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{testBanner}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {[
            { key: 'ALL', label: 'All' },
            { key: 'ORDER', label: 'Orders' },
            { key: 'PAYMENT', label: 'Payments' },
            { key: 'DELIVERY', label: 'Deliveries' },
            { key: 'PROMO', label: 'Promos & Offers' },
            { key: 'EXPIRY', label: 'Expiry Alerts' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                filterType === tab.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white h-16 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 p-4">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">No Notifications</h3>
            <p className="text-xs text-gray-500 mt-1">Tap one of the test buttons above to trigger live alerts!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => (
              <div
                key={n._id}
                className={`p-3.5 rounded-2xl border transition flex items-start space-x-3 ${
                  n.isRead ? 'bg-white border-gray-100' : 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                }`}
              >
                <div className="p-2 bg-white rounded-xl shadow-xs border border-gray-100 flex-shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-900 text-xs">{n.title}</h4>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">
                      {n.type}
                    </span>
                    {!n.isRead && (
                      <span className="text-[9px] font-bold text-emerald-600">• New</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
