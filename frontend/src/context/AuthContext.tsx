// frontend/src/context/AuthContext.tsx
'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  role: string;
  username?: string;
  iat: number;
  exp: number;
}

export interface AuthUser {
  id: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  username?: string;
  allowedStoreIds: number[];
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (userId: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  // プロフィール取得 + Context へのセット処理
  const fetchProfile = async (token: string) => {
    try {
      // API 呼び出しの際、axios 側で Authorization ヘッダーを設定する想定
      const { data } = await api.get<AuthUser>('/auth/me');
      setUser(data);
      setAuthenticated(true);
    } catch {
      // 無効なトークンなどはクリア
      localStorage.removeItem('accessToken');
      setUser(null);
      setAuthenticated(false);
    }
  };

  // 初回マウント時：トークンがあれば一度プロフィールを取得
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetchProfile(token);
      }
      setIsLoading(false);
    })();
  }, []);

  // login: トークン取得後にプロフィールをフェッチ
  const login = async (userId: string, password: string) => {
    const { data } = await api.post<{ accessToken: string }>('/auth/login', {
      userId,
      password,
    });
    localStorage.setItem('accessToken', data.accessToken);
    await fetchProfile(data.accessToken);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
