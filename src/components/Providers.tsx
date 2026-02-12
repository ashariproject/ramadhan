'use client';

import { ThemeProvider as ThemeProviderImpl } from '@/lib/ThemeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProviderImpl>
            {children}
        </ThemeProviderImpl>
    );
}
