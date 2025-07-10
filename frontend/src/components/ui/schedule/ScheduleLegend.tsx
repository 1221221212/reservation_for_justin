// src/components/ui/schedule/ScheduleLegend.tsx

import React from 'react';
import { ScheduleLegendProps } from '@/types/schedule';

/**
 * カラーレジェンドを表示するコンポーネント
 */
export default function ScheduleLegend({ items }: ScheduleLegendProps) {
  return (
    <div className="flex space-x-4 mb-4">
      {items.map(item => (
        <div key={item.id} className="flex items-center space-x-1">
          <span className={`w-4 h-4 rounded-full ${item.colorClass}`} />
          <span className="text-sm">{item.name}</span>
        </div>
      ))}
    </div>
  );
}
