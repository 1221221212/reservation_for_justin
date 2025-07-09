'use client';

import { createContext, ReactNode, useContext } from 'react';
import { create } from 'zustand';

// エラー本体の型定義
export type ApiError = {
  code?: string;
  message: string;
  details?: { field: string; message: string }[];
};

// ストアの状態と操作を定義するインターフェース
interface ErrorState {
  errors: ApiError[];
  pushError: (err: ApiError) => void;
  clearErrors: () => void;
}

// Zustand を使ったグローバルエラーストア
export const useError = create<ErrorState>((set) => ({
  errors: [],
  pushError: (err: ApiError) =>
    set((state) => ({ errors: [...state.errors, err] })),
  clearErrors: () => set({ errors: [] }),
}));

// React Context を併用したい場合の Provider
export const ErrorContext = createContext<ErrorState>(null!);
export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const state = useError();
  return <ErrorContext.Provider value={state}>{children}</ErrorContext.Provider>;
};

// Context API 経由で利用する場合のカスタムフック
export const useErrorContext = () => useContext(ErrorContext);
