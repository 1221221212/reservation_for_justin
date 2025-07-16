// frontend/src/components/ui/input.tsx
import { InputHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
        />
    );
}