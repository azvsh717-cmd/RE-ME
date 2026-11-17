import './globals.css';
import type { Metadata, Viewport } from 'next';
import { ThemeProvider, themeInitScript } from '@/components/theme';

export const metadata: Metadata = {
  title: 'Vaqt Xati — o‘zing bilan suhbat',
  description: 'O‘zingga yozilgan maktublar uchun sokin bir joy.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f7fc' },
    { media: '(prefers-color-scheme: dark)', color: '#0e0d15' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        {/* Rejimni birinchi bo‘yashdan oldin qo‘llaymiz — miltillash bo‘lmaydi */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
