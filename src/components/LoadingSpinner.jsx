
import React from 'react';

const LoadingSpinner = ({ text = 'Loading…' }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin"></div>
      <p className="text-sm font-semibold text-slate-500">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
