// frontend/src/components/ui/switch.tsx
import { ReactNode } from 'react';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}
export function Switch({ checked, onCheckedChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
        checked ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full shadow transform duration-200 ${
          checked ? 'translate-x-4' : ''
        }`}
      />
    </button>
  );
}