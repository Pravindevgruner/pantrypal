import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { orderAPI, adminAPI } from '../services/api';
import {
  Truck,
  UserCheck,
  ChevronRight,
  CheckCircle2,
  Search,
  Filter,
  FileText,
  Trash2,
  X,
  CreditCard,
  MapPin,
  Clock,
  Phone,
  Mail,
  RefreshCw,
  AlertCircle,
  PackageCheck,
  Printer,
  ShieldAlert,
} from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState('');

  // Filters & Search
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPayment, setFilterPayment] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [assignPartnerId, setAssignPartnerId] = useState('');
  const [newStatus, setNewStatus] = useState('DELIVERED');
  const [newPaymentStatus, setNewPaymentStatus] = useState('SUCCESSFUL');
  const [adminNote, setAdminNote] = useState('');

  const pollIntervalRef = useRef(null);

  useEffect(() => {
    loadOrders(true);
    loadPartners();

    // Live auto-sync every 3 seconds
    pollIntervalRef.current = setInterval(() => {
      loadOrders(false);
    }, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const loadOrders = async (isFirst = false) => {
    if (isFirst) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await orderAPI.getAllOrders({ limit: 100 });
      if (res.data.success) {
        setOrders(res.data.data.orders || []);
        setLastSync(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      if (isFirst) setLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadPartners = async () => {
    try {
      const res = await adminAPI.getUsers({ role: 'DELIVERY_PARTNER' });
      if (res.data.success) {
        setPartners(res.data.data.users || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenManageModal = (order) => {
    setSelectedOrder(order);
    setAssignPartnerId(order.deliveryPartner?._id || '');
    setNewStatus(order.orderStatus);
    setNewPaymentStatus(order.paymentStatus || 'PENDING');
    setAdminNote('');
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    try {
      await orderAPI.updateOrderStatus(selectedOrder._id, {
        status: newStatus,
        deliveryPartnerId: assignPartnerId || undefined,
        paymentStatus: newPaymentStatus,
        note: adminNote || `Status updated to ${newStatus} by Admin`,
      });
      setSelectedOrder(null);
      loadOrders(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    try {
      await orderAPI.deleteOrder(orderId);
      if (selectedOrder?._id === orderId) setSelectedOrder(null);
      loadOrders(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'ALL' && o.orderStatus !== filterStatus) return false;
    if (filterPayment !== 'ALL' && o.paymentStatus !== filterPayment) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber?.toLowerCase().includes(q);
      const matchCustomer = o.customer?.name?.toLowerCase().includes(q);
      const matchPhone = o.customer?.phone?.includes(q) || o.address?.phone?.includes(q);
      const matchCity = o.address?.city?.toLowerCase().includes(q);
      return matchNum || matchCustomer || matchPhone || matchCity;
    }
    return true;
  });

  const statusTabs = [
    { key: 'ALL', label: 'All Orders', count: orders.length },
    { key: 'PLACED', label: 'Placed', count: orders.filter((o) => o.orderStatus === 'PLACED').length },
    { key: 'CONFIRMED', label: 'Confirmed', count: orders.filter((o) => o.orderStatus === 'CONFIRMED').length },
    { key: 'ASSIGNED', label: 'Assigned', count: orders.filter((o) => o.orderStatus === 'ASSIGNED').length },
    { key: 'PICKED_UP', label: 'Picked Up', count: orders.filter((o) => o.orderStatus === 'PICKED_UP').length },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', count: orders.filter((o) => o.orderStatus === 'OUT_FOR_DELIVERY').length },
    { key: 'DELIVERED', label: 'Delivered', count: orders.filter((o) => o.orderStatus === 'DELIVERED').length },
    { key: 'CANCELLED', label: 'Cancelled', count: orders.filter((o) => o.orderStatus === 'CANCELLED').length },
  ];

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header
        title="Orders & Deliveries Management"
        subtitle="Manage customer orders, reassign delivery partners, update payment statuses & view invoices in real time"
        lastSync={lastSync}
        onRefresh={() => loadOrders(false)}
        isRefreshing={isRefreshing}
      />

      <main className="p-6 space-y-6">
        {/* Status Navigation Tabs */}
        <div className="flex items-center overflow-x-auto space-x-2 pb-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
                filterStatus === tab.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterStatus === tab.key ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, Customer Name, Phone or City..."
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">Payment:</span>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="ALL">All Payments</option>
              <option value="SUCCESSFUL">Paid / Successful</option>
              <option value="PENDING">Pending (COD/UPI)</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700">
              Showing {filteredOrders.length} of {orders.length} orders
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Live auto-sync active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer & Destination</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Assigned Partner</th>
                  <th className="p-3">Order Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-400">
                      No orders match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <span className="font-extrabold text-slate-900 block">#{o.orderNumber}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-800 block">{o.customer?.name || o.address?.fullName || 'Customer'}</span>
                        <span className="text-[11px] text-slate-500 block">{o.address?.area || ''}, {o.address?.city || 'Bengaluru'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{o.customer?.phone || o.address?.phone || ''}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">
                        {o.items?.length || 1} item(s)
                        <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                          {o.items?.[0]?.productName || ''}
                        </span>
                      </td>
                      <td className="p-3 font-black text-slate-900 text-sm">₹{o.totalAmount}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                            o.paymentStatus === 'SUCCESSFUL' || o.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : o.paymentStatus === 'FAILED'
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {o.paymentMethod} ({o.paymentStatus})
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">
                        {o.deliveryPartner ? (
                          <span className="text-slate-900 font-bold flex items-center">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                            {o.deliveryPartner.name}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            o.orderStatus === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.orderStatus === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : o.orderStatus === 'OUT_FOR_DELIVERY'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setInvoiceOrder(o)}
                          title="View Tax Invoice"
                          className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-[11px] hover:bg-slate-200 transition"
                        >
                          <FileText className="w-3.5 h-3.5 inline mr-1" />
                          Invoice
                        </button>
                        <button
                          onClick={() => handleOpenManageModal(o)}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold text-[11px] hover:bg-emerald-700 shadow-xs transition"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Comprehensive Manage Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl space-y-4 my-8 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Manage Order #{selectedOrder.orderNumber}
                </h3>
                <span className="text-xs text-slate-400">
                  Placed: {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                Customer & Delivery Address
              </span>
              <div className="flex justify-between font-semibold text-slate-700">
                <span>{selectedOrder.customer?.name || selectedOrder.address?.fullName}</span>
                <span>{selectedOrder.customer?.phone || selectedOrder.address?.phone}</span>
              </div>
              <p className="text-slate-600">
                {selectedOrder.address?.houseFlat}, {selectedOrder.address?.street}, {selectedOrder.address?.area},{' '}
                {selectedOrder.address?.city} - {selectedOrder.address?.pincode}
              </p>
            </div>

            {/* Ordered Items Breakdown */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                Ordered Grocery Items ({selectedOrder.items?.length || 0})
              </span>
              <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex justify-between items-center hover:bg-slate-50">
                    <div className="flex items-center space-x-2">
                      <img
                        src={item.productImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80'}
                        alt={item.productName}
                        className="w-8 h-8 rounded-lg object-cover border"
                      />
                      <div>
                        <span className="font-bold text-slate-800 block">{item.productName}</span>
                        <span className="text-[10px] text-slate-400">
                          Qty: {item.quantity} • Shelf Life: {item.shelfLifeDays || 7} days
                        </span>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900">₹{item.unitPrice * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
              <div>
                <span className="text-slate-500 block text-[10px]">Total Order Value</span>
                <span className="text-base font-black text-slate-900">₹{selectedOrder.totalAmount}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">Payment Method</span>
                <span className="font-bold text-slate-800">{selectedOrder.paymentMethod}</span>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="space-y-3 text-xs pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Delivery Partner</label>
                <select
                  value={assignPartnerId}
                  onChange={(e) => setAssignPartnerId(e.target.value)}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl font-semibold"
                >
                  <option value="">Unassigned (Open Dispatch Pool)</option>
                  {partners.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.phone || 'Partner'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Update Order Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl font-semibold"
                  >
                    <option value="PLACED">PLACED</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="PICKED_UP">PICKED UP</option>
                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                    <option value="DELIVERED">DELIVERED (Triggers Smart Expiry)</option>
                    <option value="CANCELLED">CANCELLED (Auto Restocks Inventory)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl font-semibold"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="SUCCESSFUL">SUCCESSFUL / PAID</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Admin Audit Note</label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Optional note for status transition..."
                  className="w-full bg-slate-50 border p-2.5 rounded-xl font-semibold"
                />
              </div>

              <div className="flex items-center space-x-2 pt-3">
                <button
                  onClick={() => handleDeleteOrder(selectedOrder._id)}
                  className="px-3 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Close
                </button>
                <button
                  onClick={handleUpdateOrder}
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-xs"
                >
                  Apply & Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tax Invoice Modal */}
      {invoiceOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 my-8 shadow-2xl">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 leading-tight">PantryPal Fresh Retail</h2>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Official GST Tax Invoice
                </span>
                <span className="text-xs text-slate-600 font-mono">Invoice #: INV-{invoiceOrder.orderNumber}</span>
              </div>
              <button
                onClick={() => setInvoiceOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl border">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block">Billed To:</span>
                <span className="font-extrabold text-slate-900 block">
                  {invoiceOrder.customer?.name || invoiceOrder.address?.fullName}
                </span>
                <span className="text-slate-600 block">{invoiceOrder.customer?.phone || invoiceOrder.address?.phone}</span>
                <span className="text-slate-500 block leading-tight mt-1">
                  {invoiceOrder.address?.houseFlat}, {invoiceOrder.address?.area}, {invoiceOrder.address?.city}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-500 uppercase text-[10px] block">Order Date:</span>
                <span className="font-semibold text-slate-800 block">
                  {new Date(invoiceOrder.createdAt).toLocaleDateString()}
                </span>
                <span className="font-bold text-slate-500 uppercase text-[10px] block mt-2">Payment Status:</span>
                <span className="font-bold text-emerald-700 block">
                  {invoiceOrder.paymentMethod} • {invoiceOrder.paymentStatus}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold uppercase text-[9px] text-slate-600">
                  <tr>
                    <th className="p-2">Item Description</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoiceOrder.items?.map((item, i) => (
                    <tr key={i}>
                      <td className="p-2 font-semibold text-slate-800">{item.productName}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-right">₹{item.unitPrice}</td>
                      <td className="p-2 text-right font-bold text-slate-900">₹{item.unitPrice * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Calculation */}
            <div className="space-y-1 text-xs border-t pt-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{invoiceOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge:</span>
                <span>₹{invoiceOrder.deliveryFee || 0}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST / Tax (Included 5%):</span>
                <span>₹{Math.round(invoiceOrder.subtotal * 0.05)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 border-t pt-2">
                <span>Total Amount Paid:</span>
                <span>₹{invoiceOrder.totalAmount}</span>
              </div>
            </div>

            {/* Smart Expiry Badge on Invoice */}
            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-[11px] text-emerald-900 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                All groceries enrolled in PantryPal Smart Expiry Engine with automated expiry reminders.
              </span>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition flex items-center justify-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setInvoiceOrder(null)}
                className="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
