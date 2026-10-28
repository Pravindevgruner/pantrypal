import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { orderAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import {
  Package,
  Clock,
  ChevronRight,
  CheckCircle2,
  Truck,
  XCircle,
  FileText,
  Printer,
  X,
  Search,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Ban,
} from 'lucide-react';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [reorderingId, setReorderingId] = useState(null);

  // Invoice Modal State
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getOrders();
      if (res.data.success) {
        setOrders(res.data.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load customer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (e, orderId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel this order? The items will be automatically restocked.')) return;
    try {
      const res = await orderAPI.cancelOrder(orderId);
      if (res.data.success) {
        await loadOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error cancelling order');
    }
  };

  const handleReorder = async (e, order) => {
    e.stopPropagation();
    setReorderingId(order._id);
    try {
      for (const item of order.items) {
        const prodId = item.product?._id || item.product;
        if (prodId) {
          await addToCart(prodId, item.quantity || 1);
        }
      }
      navigate('/cart');
    } catch (err) {
      console.error('Reorder error:', err);
      alert('Could not add some items to cart.');
    } finally {
      setReorderingId(null);
    }
  };

  const handleOpenInvoice = async (e, orderId) => {
    e.stopPropagation();
    setInvoiceModalOpen(true);
    setLoadingInvoice(true);
    try {
      const res = await orderAPI.getInvoice(orderId);
      if (res.data.success) {
        setCurrentInvoice(res.data.data.invoice);
      }
    } catch (err) {
      console.error('Failed to fetch invoice:', err);
      alert('Failed to load invoice details.');
    } finally {
      setLoadingInvoice(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'DELIVERED')
      return (
        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Delivered
        </span>
      );
    if (status === 'CANCELLED')
      return (
        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
          <XCircle className="w-3 h-3 mr-1 text-red-600" /> Cancelled
        </span>
      );
    return (
      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
        <Truck className="w-3 h-3 mr-1 animate-pulse text-amber-600" /> {status.replace(/_/g, ' ')}
      </span>
    );
  };

  // Filter & Search Logic
  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ACTIVE') {
      if (['DELIVERED', 'CANCELLED'].includes(o.orderStatus)) return false;
    } else if (filterStatus === 'DELIVERED') {
      if (o.orderStatus !== 'DELIVERED') return false;
    } else if (filterStatus === 'CANCELLED') {
      if (o.orderStatus !== 'CANCELLED') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber?.toLowerCase().includes(q);
      const matchItem = o.items?.some((it) => it.productName?.toLowerCase().includes(q));
      return matchNum || matchItem;
    }
    return true;
  });

  const filterTabs = [
    { key: 'ALL', label: 'All Orders', count: orders.length },
    {
      key: 'ACTIVE',
      label: 'Active & In-Transit',
      count: orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.orderStatus)).length,
    },
    { key: 'DELIVERED', label: 'Delivered', count: orders.filter((o) => o.orderStatus === 'DELIVERED').length },
    { key: 'CANCELLED', label: 'Cancelled', count: orders.filter((o) => o.orderStatus === 'CANCELLED').length },
  ];

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50">
      <Navbar />

      <div className="px-4 py-4 space-y-4">
        {/* Page Title & Stats */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-extrabold text-base text-gray-900">Order History & Invoices</h2>
            <p className="text-[11px] text-gray-500">Track shipments, download tax invoices & reorder anytime</p>
          </div>
          <span className="text-xs font-black bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-xl border border-emerald-100">
            {orders.length} Total
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order # or grocery item..."
            className="w-full bg-white border border-gray-200 pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
                filterStatus === tab.key
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterStatus === tab.key ? 'bg-emerald-800 text-emerald-100' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Order Cards List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white h-36 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 p-6 space-y-2">
            <Package className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-800 text-sm">No Orders Found</h3>
            <p className="text-xs text-gray-500">
              {searchQuery ? 'No orders match your search keyword.' : 'You have not placed any orders under this tab.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition cursor-pointer space-y-3"
              >
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-50 pb-2.5">
                  <div>
                    <span className="font-extrabold text-xs text-gray-900 block">#{order.orderNumber}</span>
                    <span className="text-[10px] text-gray-400 font-medium flex items-center mt-0.5">
                      <Clock className="w-3 h-3 mr-1 text-gray-400" />
                      {new Date(order.createdAt).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                  {getStatusBadge(order.orderStatus)}
                </div>

                {/* Items preview carousel */}
                <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="relative flex-shrink-0 group">
                      <img
                        src={
                          item.productImage ||
                          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded-xl border border-gray-100 shadow-2xs"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[9px] font-black px-1 rounded-md">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                  <div className="text-xs text-gray-500 pl-2">
                    <span className="font-bold text-gray-800 block truncate max-w-[140px]">
                      {order.items?.[0]?.productName}
                    </span>
                    {order.items?.length > 1 && (
                      <span className="text-[10px] text-gray-400">+ {order.items.length - 1} more item(s)</span>
                    )}
                  </div>
                </div>

                {/* Pricing & Payment Status */}
                <div className="flex justify-between items-center pt-1 border-t border-gray-50 text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Total Amount</span>
                    <span className="font-black text-sm text-gray-900">₹{order.totalAmount}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Payment</span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block ${
                        order.paymentStatus === 'SUCCESSFUL'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {order.paymentMethod} • {order.paymentStatus || 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-gray-50">
                  <button
                    onClick={(e) => handleOpenInvoice(e, order._id)}
                    className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-[11px] flex items-center justify-center space-x-1 border border-slate-200 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tax Invoice</span>
                  </button>

                  <button
                    onClick={(e) => handleReorder(e, order)}
                    disabled={reorderingId === order._id}
                    className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-[11px] flex items-center justify-center space-x-1 border border-emerald-200 transition"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 text-emerald-600 ${reorderingId === order._id ? 'animate-spin' : ''}`} />
                    <span>{reorderingId === order._id ? 'Adding...' : 'Order Again'}</span>
                  </button>

                  {['PLACED', 'CONFIRMED'].includes(order.orderStatus) && (
                    <button
                      onClick={(e) => handleCancelOrder(e, order._id)}
                      className="py-1.5 px-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-[11px] flex items-center space-x-1 border border-red-200 transition"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reusable Tax Invoice Modal */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl text-xs relative space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🏪</span>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">OFFICIAL TAX INVOICE</h3>
                  <p className="text-[10px] text-gray-400">PantryPal Technologies Pvt Ltd</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 flex items-center space-x-1 font-bold text-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={() => setInvoiceModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loadingInvoice ? (
              <div className="py-12 text-center text-gray-400">
                <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p>Generating Official Invoice...</p>
              </div>
            ) : currentInvoice ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Invoice No</span>
                    <span className="font-extrabold text-gray-900">{currentInvoice.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Invoice Date</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(currentInvoice.invoiceDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">GSTIN / FSSAI</span>
                    <span className="font-mono text-[10px] text-gray-700">{currentInvoice.seller.gstin}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Payment Status</span>
                    <span className="font-extrabold text-emerald-700">
                      {currentInvoice.payment.method} ({currentInvoice.payment.status})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 border border-gray-100 rounded-xl space-y-0.5">
                    <p className="font-bold text-gray-900 uppercase text-[10px] text-emerald-800">Sold By</p>
                    <p className="font-extrabold text-gray-800">{currentInvoice.seller.brandName}</p>
                    <p className="text-gray-500 text-[10px]">{currentInvoice.seller.hubAddress}</p>
                    <p className="text-gray-500 text-[10px]">FSSAI: {currentInvoice.seller.fssaiLicense}</p>
                  </div>
                  <div className="p-3 border border-gray-100 rounded-xl space-y-0.5">
                    <p className="font-bold text-gray-900 uppercase text-[10px] text-emerald-800">Shipped To</p>
                    <p className="font-extrabold text-gray-800">{currentInvoice.customer.name}</p>
                    <p className="text-gray-500 text-[10px]">{currentInvoice.customer.shippingAddress}</p>
                    <p className="text-gray-500 text-[10px]">Phone: {currentInvoice.customer.phone}</p>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[9px]">
                      <tr>
                        <th className="p-2">#</th>
                        <th className="p-2">Item Description</th>
                        <th className="p-2 text-center">HSN</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Price</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentInvoice.items.map((it) => (
                        <tr key={it.srNo}>
                          <td className="p-2 text-gray-400">{it.srNo}</td>
                          <td className="p-2 font-semibold text-gray-800">{it.name}</td>
                          <td className="p-2 text-center text-gray-400 font-mono text-[10px]">{it.hsn}</td>
                          <td className="p-2 text-center text-gray-700">{it.quantity}</td>
                          <td className="p-2 text-right text-gray-700">₹{it.unitPrice}</td>
                          <td className="p-2 text-right font-bold text-gray-900">₹{it.itemTotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Taxable Value</span>
                    <span>₹{currentInvoice.pricing.netTaxableAmount}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST (5% Integrated)</span>
                    <span>₹{currentInvoice.pricing.taxAmount}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charges</span>
                    <span>{currentInvoice.pricing.deliveryFee === 0 ? 'FREE' : `₹${currentInvoice.pricing.deliveryFee}`}</span>
                  </div>
                  <hr className="my-1 border-gray-200" />
                  <div className="flex justify-between font-extrabold text-sm text-gray-900 pt-1">
                    <span>Grand Total Paid</span>
                    <span className="text-emerald-600">₹{currentInvoice.pricing.totalAmount}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[10px] text-emerald-900">
                  🌱 <strong>Smart Expiry Protection:</strong> {currentInvoice.smartExpiryInfo?.message || 'Automatic fresh monitoring active'}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
