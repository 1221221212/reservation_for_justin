// frontend/src/components/ui/button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
}
export function Button({ children, ...props }: ButtonProps) {
    return (
        <button
            {...props}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring"
        >
            {children}
        </button>
    );
}
