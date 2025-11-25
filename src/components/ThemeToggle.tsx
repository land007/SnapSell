"use client";

import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 只在客户端执行
    setMounted(true);
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // 保存到localStorage
    localStorage.setItem('theme', theme);

    // 获取系统偏好
    const getSystemTheme = (): 'light' | 'dark' => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // 应用主题
    const root = document.documentElement;
    const themeToApply = theme === 'system' ? getSystemTheme() : theme;

    if (themeToApply === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 监听系统偏好变化（仅在自动模式）
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [theme, mounted]);

  const cycleTheme = () => {
    setTheme((prev) => {
      if (prev === 'system') return 'light';
      if (prev === 'light') return 'dark';
      return 'system';
    });
  };

  const getIcon = () => {
    if (theme === 'light') return <Sun size={18} />;
    if (theme === 'dark') return <Moon size={18} />;
    return <Monitor size={18} />;
  };

  const getLabel = () => {
    if (theme === 'light') return '亮色模式';
    if (theme === 'dark') return '暗色模式';
    return '跟随系统';
  };

  // 避免水合不匹配，在挂载前显示占位符
  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg hover:bg-secondary transition-colors"
        aria-label="主题切换"
      >
        <Monitor size={18} />
      </button>
    );
  }

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
      <span className="text-sm hidden sm:inline">{getLabel()}</span>
    </button>
  );
}

