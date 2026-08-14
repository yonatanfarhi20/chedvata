import { Heebo } from 'next/font/google';
import './globals.css';

const heebo = Heebo({
  variable: '--font-heebo',
  subsets: ['hebrew', 'latin'],
});

export const metadata = {
  title: 'ישיבת חדוותא',
  description: 'מערכת ניהול ישיבת חדוותא',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
