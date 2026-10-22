import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import dayjs from 'dayjs';
import { colors, spacing } from '../styles/theme';
import Header from '../components/Header';
import { orderAPI } from '../services/api';

const OrderDetailsScreen = ({ navigation, route }) => {
  const { order: initialOrder } = route.params || {};
  const [order, setOrder] = useState(initialOrder);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!order) {
    return (
      <View style={styles.container}>
        <Header title="Order Details" showBack onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Order not found</Text>
        </View>
      </View>
    );
  }

  const orderId = order._id || order.id;
  const status = (order.orderStatus || order.status || 'PENDING').toUpperCase();

  const STEPS = ['PLACED', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentStepIdx = STEPS.indexOf(status) > -1 ? STEPS.indexOf(status) : 0;
  const isCancellable = status === 'PLACED' || status === 'CONFIRMED';

  const handleOpenInvoice = async () => {
    setShowInvoiceModal(true);
    if (!invoice) {
      setLoadingInvoice(true);
      try {
        const res = await orderAPI.getInvoice(orderId);
        const data = res.data?.data?.invoice || res.data?.invoice;
        setInvoice(data);
      } catch (err) {
        Alert.alert('Invoice', 'Failed to load official tax invoice.');
      } finally {
        setLoadingInvoice(false);
      }
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? Any payments will be refunded to the original payment source.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              const res = await orderAPI.cancelOrder(orderId);
              setOrder((prev) => ({
                ...prev,
                status: 'CANCELLED',
                orderStatus: 'CANCELLED',
              }));
              Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Could not cancel order');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={`Order #${(order.orderNumber || orderId.slice(-8)).toUpperCase()}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Timeline Progress Bar */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Live Tracking</Text>
            {status === 'CANCELLED' ? (
              <View style={styles.cancelledBadge}>
                <Text style={styles.cancelledText}>CANCELLED</Text>
              </View>
            ) : null}
          </View>

          {status !== 'CANCELLED' && (
            <View style={styles.timelineContainer}>
              {STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <View key={step} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepCircle,
                        isCompleted && styles.completedCircle,
                        isCurrent && styles.activeCircle,
                      ]}
                    >
                      <Text style={[styles.stepNum, isCompleted && { color: '#ffffff' }]}>
                        {isCompleted ? '✓' : idx + 1}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        isCompleted && styles.completedLabel,
                      ]}
                    >
                      {step.replace(/_/g, ' ')}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Invoice & Actions Banner */}
        <View style={styles.actionBanner}>
          <TouchableOpacity
            style={styles.invoiceBtn}
            onPress={handleOpenInvoice}
          >
            <Text style={styles.invoiceBtnText}>📄 View & Download Tax Invoice</Text>
          </TouchableOpacity>

          {isCancellable && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancelOrder}
              disabled={cancelling}
            >
              <Text style={styles.cancelBtnText}>
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Delivery Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Delivery Information</Text>
          <Text style={styles.addressName}>
            {order.deliveryAddress?.fullName || order.address?.fullName || 'Customer'}
          </Text>
          <Text style={styles.addressText}>
            {order.deliveryAddress?.houseFlat || order.address?.houseFlat || 'Flat 402'}, {order.deliveryAddress?.street || order.address?.street || '12th Cross'}
          </Text>
          <Text style={styles.addressText}>
            {order.deliveryAddress?.city || order.address?.city || 'Bengaluru'}, {order.deliveryAddress?.pincode || order.address?.pincode || '560103'}
          </Text>
          <Text style={[styles.addressText, { marginTop: 4, fontWeight: '600' }]}>
            Slot: {order.deliverySlot || 'Instant Express (25-35 mins)'}
          </Text>
        </View>

        {/* Items Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ordered Groceries ({order.items?.length || 0})</Text>
          {order.items?.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name || item.productName || item.product?.name}</Text>
                <Text style={styles.itemMeta}>
                  Qty: {item.quantity} • Shelf Life: {item.shelfLifeDays || 7} days
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                ₹{(item.unitPrice || item.price || 0) * item.quantity}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.pantryTrackerBanner}
            onPress={() => navigation.navigate('SmartExpiry')}
          >
            <Text style={styles.trackerBannerText}>
              ⏱️ All items from this order are tracked in Smart Expiry →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bill Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment & Bill</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Payment Method</Text>
            <Text style={styles.billValue}>{order.paymentMethod || 'Razorpay / UPI'}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Payment Status</Text>
            <Text style={[styles.billValue, { color: colors.primaryDark }]}>
              {order.paymentStatus || 'PAID'}
            </Text>
          </View>
          <View style={styles.billDivider} />
          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Tax Invoice Modal */}
      <Modal visible={showInvoiceModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🧾 Official Tax Invoice</Text>
              <TouchableOpacity onPress={() => setShowInvoiceModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingInvoice ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 10, color: colors.textMuted }}>Generating Tax Invoice...</Text>
              </View>
            ) : invoice ? (
              <ScrollView style={styles.invoiceScroll}>
                {/* Meta Header */}
                <View style={styles.invoiceMeta}>
                  <View>
                    <Text style={styles.invoiceMetaLabel}>INVOICE NO</Text>
                    <Text style={styles.invoiceMetaVal}>{invoice.invoiceNumber}</Text>
                  </View>
                  <View>
                    <Text style={styles.invoiceMetaLabel}>DATE</Text>
                    <Text style={styles.invoiceMetaVal}>
                      {dayjs(invoice.invoiceDate).format('DD MMM YYYY')}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.invoiceMetaLabel}>PAYMENT</Text>
                    <Text style={styles.invoiceMetaVal}>{invoice.payment?.method}</Text>
                  </View>
                </View>

                {/* Seller & Customer */}
                <View style={styles.partyRow}>
                  <View style={styles.partyBox}>
                    <Text style={styles.partyHeader}>SOLD BY</Text>
                    <Text style={styles.partyName}>{invoice.seller?.brandName}</Text>
                    <Text style={styles.partySub}>{invoice.seller?.hubAddress}</Text>
                    <Text style={styles.partySub}>GSTIN: {invoice.seller?.gstin}</Text>
                    <Text style={styles.partySub}>FSSAI: {invoice.seller?.fssaiLicense}</Text>
                  </View>

                  <View style={styles.partyBox}>
                    <Text style={styles.partyHeader}>BILLED TO</Text>
                    <Text style={styles.partyName}>{invoice.customer?.name}</Text>
                    <Text style={styles.partySub}>{invoice.customer?.shippingAddress}</Text>
                    <Text style={styles.partySub}>Phone: {invoice.customer?.phone}</Text>
                  </View>
                </View>

                {/* Itemised Table */}
                <View style={styles.tableCard}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.th, { flex: 2 }]}>Item</Text>
                    <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Qty</Text>
                    <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Rate</Text>
                    <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Amount</Text>
                  </View>
                  {invoice.items?.map((it, idx) => (
                    <View key={idx} style={styles.tableRow}>
                      <Text style={[styles.td, { flex: 2 }]} numberOfLines={1}>{it.name}</Text>
                      <Text style={[styles.td, { flex: 1, textAlign: 'center' }]}>{it.quantity}</Text>
                      <Text style={[styles.td, { flex: 1, textAlign: 'right' }]}>₹{it.unitPrice}</Text>
                      <Text style={[styles.td, { flex: 1, textAlign: 'right', fontWeight: '700' }]}>
                        ₹{it.itemTotal}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Pricing Breakdown */}
                <View style={styles.calcCard}>
                  <View style={styles.calcRow}>
                    <Text style={styles.calcLabel}>Taxable Goods Value</Text>
                    <Text style={styles.calcVal}>₹{invoice.pricing?.netTaxableAmount}</Text>
                  </View>
                  <View style={styles.calcRow}>
                    <Text style={styles.calcLabel}>GST (5% Integrated Tax)</Text>
                    <Text style={styles.calcVal}>₹{invoice.pricing?.taxAmount}</Text>
                  </View>
                  <View style={styles.calcRow}>
                    <Text style={styles.calcLabel}>Delivery & Packaging</Text>
                    <Text style={styles.calcVal}>
                      {invoice.pricing?.deliveryFee === 0 ? 'FREE' : `₹${invoice.pricing?.deliveryFee}`}
                    </Text>
                  </View>
                  <View style={styles.calcDivider} />
                  <View style={styles.calcRow}>
                    <Text style={styles.grandLabel}>Grand Total Paid</Text>
                    <Text style={styles.grandVal}>₹{invoice.pricing?.totalAmount}</Text>
                  </View>
                </View>

                <View style={styles.guaranteeBox}>
                  <Text style={styles.guaranteeText}>
                    🌱 Smart Expiry Guarantee: All items from this invoice are actively tracked in PantryPal Smart Expiry engine.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeInvoiceBtn}
                  onPress={() => setShowInvoiceModal(false)}
                >
                  <Text style={styles.closeInvoiceText}>Close Invoice</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  cancelledBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cancelledText: {
    color: '#b91c1c',
    fontSize: 10,
    fontWeight: '800',
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  completedCircle: {
    backgroundColor: colors.primary,
  },
  activeCircle: {
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  stepLabel: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    fontWeight: '600',
  },
  completedLabel: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  actionBanner: {
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  invoiceBtn: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 6,
  },
  invoiceBtnText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '800',
  },
  cancelBtn: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#b91c1c',
    fontSize: 11,
    fontWeight: '800',
  },
  addressName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  addressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  itemMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  pantryTrackerBanner: {
    marginTop: spacing.md,
    backgroundColor: '#f0fdf4',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  trackerBannerText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '700',
    textAlign: 'center',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  billLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  billValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  billDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  closeBtn: {
    fontSize: 18,
    color: colors.textMuted,
    padding: 4,
  },
  invoiceScroll: {
    marginBottom: 10,
  },
  invoiceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: spacing.sm,
    borderRadius: 10,
    marginBottom: spacing.md,
  },
  invoiceMetaLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '700',
  },
  invoiceMetaVal: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  partyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  partyBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.sm,
    marginHorizontal: 3,
  },
  partyHeader: {
    fontSize: 9,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  partyName: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  partySub: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 1,
  },
  tableCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: spacing.xs,
  },
  th: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  td: {
    fontSize: 10,
    color: colors.text,
  },
  calcCard: {
    backgroundColor: '#f9fafb',
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.md,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  calcLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  calcVal: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  calcDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 6,
  },
  grandLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  grandVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  guaranteeBox: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  guaranteeText: {
    fontSize: 10,
    color: '#065f46',
    lineHeight: 14,
  },
  closeInvoiceBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  closeInvoiceText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});

export default OrderDetailsScreen;
