import React from 'react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center space-y-2 pointer-events-none w-[90%] max-w-sm">
      {toasts.map((t) => {
        let icon = 'fa-circle-info';
        let border = 'border-slate-200';
        let textCol = 'text-slate-900';
        let bgCol = 'bg-white';

        if (t.type === 'success') {
          icon = 'fa-circle-check text-[#059669]';
          border = 'border-emerald-200';
        } else if (t.type === 'error') {
          icon = 'fa-circle-exclamation text-red-500';
          border = 'border-red-200';
        } else if (t.type === 'info') {
          icon = 'fa-bolt text-[#FF7A00]';
          border = 'border-orange-200';
        }

        return (
          <div
            key={t.id}
            onClick={() => onDismiss(t.id)}
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-2xl ${bgCol} border ${border} shadow-xl backdrop-blur-md pointer-events-auto transform transition-all duration-300 text-xs font-semibold ${textCol} animate-pop cursor-pointer`}
          >
            <i className={`fa-solid ${icon} text-sm shrink-0`}></i>
            <span className="flex-1">{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
