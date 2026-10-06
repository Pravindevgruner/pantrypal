import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle2, Trash2 } from 'lucide-react';

export default function ExpiryBadge({ status, daysRemaining }) {
  if (status === 'FRESH') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
        <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
        Fresh ({daysRemaining} days left)
      </span>
    );
  }

  if (status === 'EXPIRING_SOON') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
        <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
        Expiring Soon ({daysRemaining <= 0 ? 'Today' : `${daysRemaining}d`})
      </span>
    );
  }

  if (status === 'EXPIRED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
        <XCircle className="w-3 h-3 mr-1 text-red-600" />
        Expired
      </span>
    );
  }

  if (status === 'CONSUMED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <CheckCircle2 className="w-3 h-3 mr-1 text-blue-600" />
        Consumed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
      <Trash2 className="w-3 h-3 mr-1 text-gray-500" />
      Discarded
    </span>
  );
}
