import AdminAppLayout from '@/components/layout/AdminLayout';

export const metadata = {
  title: 'הנהלה | ישיבת חדוותא',
};

export default function AdminLayout({ children }) {
  return <AdminAppLayout>{children}</AdminAppLayout>;
}
