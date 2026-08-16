import AdminNavigationFrame from '@/components/layout/AdminNavigationFrame';

export const metadata = {
  title: 'הנהלה | ישיבת חדוותא',
};

export default function AdminLayout({ children }) {
  return <AdminNavigationFrame>{children}</AdminNavigationFrame>;
}
