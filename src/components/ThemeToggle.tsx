'use client';

import { useTheme } from '@/lib/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render until mounted to avoid SSR issues
    if (!mounted) {
        return (
            <div className="p-2.5 rounded-full bg-secondary w-10 h-10" />
        );
    }

    return <ThemeToggleInner />;
}

function ThemeToggleInner() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-secondary text-foreground hover:opacity-80 transition-all duration-200"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5" />
            ) : (
                <Sun className="w-5 h-5" />
            )}
        </button>
    );
}
