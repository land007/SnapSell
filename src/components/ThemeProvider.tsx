"use client";

import { useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    // 获取存储的主题偏好
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    
    // 获取系统偏好
    const getSystemTheme = (): 'light' | 'dark' => {
      if (typeof window === 'undefined') return 'light';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // 确定要应用的主题
    const themeToApply = storedTheme === 'system' || !storedTheme 
      ? getSystemTheme() 
      : storedTheme;

    // 应用主题
    const root = document.documentElement;
    if (themeToApply === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 如果选择的是自动模式，监听系统偏好变化
    if (storedTheme === 'system' || !storedTheme) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };

      // 使用addEventListener（现代浏览器支持）
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        // 兼容旧浏览器
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, []);

  return <>{children}</>;
}

