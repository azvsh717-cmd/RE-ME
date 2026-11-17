import './globals.css';
import type { Metadata } from 'next';
export const metadata:Metadata={title:'Vaqt Xati — o‘zing bilan suhbat',description:'O‘zingga yozilgan maktublar uchun sokin bir joy.'};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="uz"><body>{children}</body></html>; }
