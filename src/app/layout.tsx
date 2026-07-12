import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: '公基备考 - 公务员考试公共基础知识学习平台',
  description: '覆盖公务员考试公共基础知识全部学科：政治理论、法律知识、经济常识、公文写作、人文历史、文学常识、科技常识、理化生、地理常识、国情省情',
  keywords: '公基,公共基础知识,公务员考试,事业单位考试,备考,刷题,模拟考试',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
