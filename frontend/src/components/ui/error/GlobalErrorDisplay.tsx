'use client';

import React from 'react';
import { useError, ApiError } from '@/context/ErrorContext';

/**
 * アプリ全体のエラーをトースト表示するコンポーネント
 */
export default function GlobalErrorDisplay() {
  const { errors, clearErrors } = useError();

  if (errors.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50 max-w-xs">
      {errors.map((err: ApiError, idx: number) => (
        <div key={idx} className="p-4 bg-red-100 border border-red-400 rounded shadow">
          <p className="font-bold text-red-700">{err.code || 'Error'}</p>
          <p className="mt-1 text-red-800">{err.message}</p>
          {err.details && (
            <ul className="mt-2 list-disc list-inside text-red-700 text-sm">
              {err.details.map((detail: { field: string; message: string }, i: number) => (
                <li key={i}>{`${detail.field}: ${detail.message}`}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
      <button
        onClick={clearErrors}
        className="mt-2 block text-sm text-blue-500 underline"
      >
        閉じる
      </button>
    </div>
  );
}
