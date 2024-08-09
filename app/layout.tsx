import { NextUIProvider } from '@nextui-org/react';
import React from "react";
import './globals.css';
import { Inter } from 'next/font/google';

const InterFont = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={InterFont.className}>
        <body>
        <NextUIProvider>
            {children}
        </NextUIProvider>
        </body>
        </html>
    )
}