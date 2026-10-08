import React from 'react';
import { X, Package, Calendar, Truck, Shield } from 'lucide-react';
import { MOCK_ORDERS } from '../constants';
import { MockOrder } from '../types';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskAboutOrder: (question: string) => void;
}

export const OrdersModal: React.FC<OrdersModalProps> = ({ isOpen, onClose, onAskAboutOrder }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#08090d]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#08090d] border border-[#272a38] rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-[#171923] flex items-center justify-between bg-[#171923]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e11d48]/20 border border-[#e11d48]/40 flex items-center justify-center text-[#e11d48]">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-sm text-[#f8fafc] tracking-wider">
                LOGISTICAL REGISTRY
              </h3>
              <p className="text-[11px] text-slate-400">Recorded inventory and fulfillment records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-[#f8fafc] hover:bg-[#171923] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="p-3 rounded-xl bg-[#171923]/90 border border-[#d97706]/30 flex items-start gap-2.5 text-xs text-slate-300">
            <Shield className="w-4 h-4 text-[#d97706] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-cinzel font-bold text-[#d97706] block mb-0.5">AUTHORITATIVE LOGISTICAL PROTOCOL</span>
              <span>All inventory verifications, telemetry tracking, and return approvals are executed strictly per standardized operational criteria.</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Verified order manifests on record:
          </p>

          <div className="space-y-3">
            {MOCK_ORDERS.map((order: MockOrder) => (
              <div
                key={order.orderId}
                className="p-4 rounded-xl bg-[#171923]/70 border border-[#272a38] hover:border-[#d97706]/60 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#d97706]">{order.orderId}</span>
                    <span
                      className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full ${
                        order.status === 'Delivered'
                          ? 'bg-[#171923] text-[#d97706] border border-[#d97706]/40'
                          : 'bg-[#171923] text-slate-300 border border-slate-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#d97706]" /> {order.date}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1 mb-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-slate-200">
                      <span>{item.name} quantity {item.quantity}</span>
                      <span className="font-mono text-slate-400">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-[#272a38] pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>{order.carrier} tracking number <strong className="font-mono text-[#f8fafc]">{order.trackingNumber}</strong></span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onAskAboutOrder(`State delivery status and courier location for ${order.orderId}`);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-[#272a38] hover:bg-[#d97706] hover:text-[#08090d] text-[#f8fafc] text-xs font-semibold transition"
                    >
                      Audit Status
                    </button>
                    <button
                      onClick={() => {
                        onAskAboutOrder(`Initiate return eligibility assessment for ${order.orderId}`);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-[#e11d48] hover:bg-[#be123c] text-[#f8fafc] text-xs font-semibold transition"
                    >
                      Return Analysis
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
