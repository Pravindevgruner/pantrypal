import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { orderAPI } from '../services/api';
import { ArrowLeft, MapPin, Truck, CheckCircle2, XCircle, Clock, ShieldCheck, Phone, FileText, Download, Printer, X } from 'lucide-react';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getOrderById(id);
      if (res.data.success) {
        setOrder(res.data.data.order);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await orderAPI.cancelOrder(id);
      if (res.data.success) {
        setOrder(res.data.data.order);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error cancelling order');
    }
  };

  const handleViewInvoice = async () => {
    setShowInvoiceModal(true);
    if (!invoiceData) {
      setLoadingInvoice(true);
      try {
        const res = await orderAPI.getInvoice(id);
        if (res.data.success) {
          setInvoiceData(res.data.data.invoice);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingInvoice(false);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const statuses = ['PLACED', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  const getStatusStepIndex = (status) => {
    if (status === 'CANCELLED') return -1;
    return statuses.indexOf(status);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 p-4 animate-pulse">
        <div className="h-40 bg-gray-200 rounded-2xl mb-4"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 p-6 text-center">
        <p className="text-sm font-semibold text-gray-700">Order not found</p>
      </div>
    );
  }

  const currentStep = getStatusStepIndex(order.orderStatus);

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 shadow-xs z-30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/orders')} className="p-1 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-extrabold text-sm text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-[10px] text-gray-500">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
          ₹{order.totalAmount}
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Order Status Stepper */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-500 flex items-center">
            <Truck className="w-4 h-4 text-emerald-600 mr-1" />
            Live Delivery Tracking
          </h3>

          {order.orderStatus === 'CANCELLED' ? (
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs font-semibold flex items-center">
              <XCircle className="w-4 h-4 mr-2 text-red-600" />
              Order has been cancelled.
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {statuses.map((st, idx) => {
                const isCompleted = currentStep >= idx;
                const isCurrent = currentStep === idx;

                return (
                  <div key={st} className="relative flex items-center text-xs">
                    <div
                      className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white transition ${
                        isCompleted
                          ? 'border-emerald-600 text-emerald-600'
                          : 'border-gray-300 text-gray-300'
                      } ${isCurrent ? 'ring-4 ring-emerald-100 bg-emerald-600 text-white' : ''}`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>}
                    </div>

                    <div className="ml-2">
                      <span className={`font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {st.replace(/_/g, ' ')}
                      </span>
                      {isCurrent && (
                        <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 animate-pulse">
                          In Progress...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Delivery Partner Details if assigned */}
          {order.deliveryPartner && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs mt-2">
              <div className="flex items-center space-x-2">
                <img
                  src={order.deliveryPartner.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt="Partner"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <span className="font-bold text-gray-900">{order.deliveryPartner.name}</span>
                  <p className="text-[10px] text-gray-500">Assigned Delivery Agent</p>
                </div>
              </div>
              <a
                href={`tel:${order.deliveryPartner.phone}`}
                className="p-2 bg-emerald-600 text-white rounded-lg flex items-center hover:bg-emerald-700"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Map Preview Simulation */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-900 flex items-center">
              <MapPin className="w-4 h-4 text-emerald-600 mr-1" />
              Delivery Location
            </span>
            <span className="text-gray-500">{order.address?.city}</span>
          </div>

          <div className="bg-emerald-950/90 text-white rounded-xl p-3 text-xs space-y-1">
            <p className="font-bold">{order.address?.fullName} ({order.address?.phone})</p>
            <p className="text-[11px] text-gray-300">
              {order.address?.houseFlat}, {order.address?.street}, {order.address?.area}, {order.address?.pincode}
            </p>
          </div>
        </div>

        {/* Invoice Item List */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-500 flex items-center">
            <FileText className="w-4 h-4 text-emerald-600 mr-1" />
            Invoice Items ({order.items?.length})
          </h3>

          <div className="divide-y divide-gray-100">
            {order.items?.map((item) => (
              <div key={item._id} className="py-2 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <img
                    src={item.productImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                    alt={item.productName}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div>
                    <span className="font-bold text-gray-800">{item.productName}</span>
                    <p className="text-[10px] text-gray-400">Qty: {item.quantity} x ₹{item.unitPrice}</p>
                  </div>
                </div>
                <span className="font-extrabold text-gray-900">₹{item.quantity * item.unitPrice}</span>
              </div>
            ))}
          </div>

          <hr className="my-2 border-gray-100" />
          <div className="flex justify-between text-xs font-extrabold text-gray-900">
            <span>Total Paid</span>
            <span className="text-emerald-600">₹{order.totalAmount}</span>
          </div>

          <button
            onClick={handleViewInvoice}
            className="w-full mt-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition border border-emerald-200"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>View & Download Tax Invoice</span>
          </button>
        </div>

        {/* Cancel Button if early stage */}
        {['PLACED', 'CONFIRMED'].includes(order.orderStatus) && (
          <button
            onClick={handleCancelOrder}
            className="w-full py-3 bg-red-50 border border-red-200 text-red-700 font-bold rounded-xl text-xs hover:bg-red-100"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Tax Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl text-xs relative space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🏪</span>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">TAX INVOICE</h3>
                  <p className="text-[10px] text-gray-400">PantryPal Technologies Pvt Ltd</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="p-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 flex items-center space-x-1 font-bold text-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
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
            ) : invoiceData ? (
              <div className="space-y-4 printable-area">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Invoice No</span>
                    <span className="font-extrabold text-gray-900">{invoiceData.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Order Date</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(invoiceData.invoiceDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">GSTIN / FSSAI</span>
                    <span className="font-mono text-[10px] text-gray-700">{invoiceData.seller.gstin}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Payment Method</span>
                    <span className="font-extrabold text-emerald-700">{invoiceData.payment.method} ({invoiceData.payment.status})</span>
                  </div>
                </div>

                {/* Seller & Customer */}
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 border border-gray-100 rounded-xl space-y-0.5">
                    <p className="font-bold text-gray-900 uppercase text-[10px] text-emerald-800">Sold By</p>
                    <p className="font-extrabold text-gray-800">{invoiceData.seller.brandName}</p>
                    <p className="text-gray-500 text-[10px]">{invoiceData.seller.hubAddress}</p>
                    <p className="text-gray-500 text-[10px]">FSSAI: {invoiceData.seller.fssaiLicense}</p>
                  </div>
                  <div className="p-3 border border-gray-100 rounded-xl space-y-0.5">
                    <p className="font-bold text-gray-900 uppercase text-[10px] text-emerald-800">Billed / Shipped To</p>
                    <p className="font-extrabold text-gray-800">{invoiceData.customer.name}</p>
                    <p className="text-gray-500 text-[10px]">{invoiceData.customer.shippingAddress}</p>
                    <p className="text-gray-500 text-[10px]">Phone: {invoiceData.customer.phone}</p>
                  </div>
                </div>

                {/* Items Table */}
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
                      {invoiceData.items.map((it) => (
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

                {/* Pricing Breakdown */}
                <div className="bg-gray-50 p-4 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Taxable Value (Goods)</span>
                    <span>₹{invoiceData.pricing.netTaxableAmount}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST (5% Integrated / CGST+SGST)</span>
                    <span>₹{invoiceData.pricing.taxAmount}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery & Packaging Fee</span>
                    <span>{invoiceData.pricing.deliveryFee === 0 ? 'FREE' : `₹${invoiceData.pricing.deliveryFee}`}</span>
                  </div>
                  {invoiceData.pricing.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Promotional Discount</span>
                      <span>-₹{invoiceData.pricing.discount}</span>
                    </div>
                  )}
                  <hr className="my-1 border-gray-200" />
                  <div className="flex justify-between font-extrabold text-sm text-gray-900 pt-1">
                    <span>Grand Total Paid</span>
                    <span className="text-emerald-600">₹{invoiceData.pricing.totalAmount}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[10px] text-emerald-900">
                  🌱 <strong>Smart Expiry Guarantee:</strong> {invoiceData.smartExpiryInfo.message}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
