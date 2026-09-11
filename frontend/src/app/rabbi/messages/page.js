import MessagesManagementPanel from '@/components/admin/messages/MessagesManagementPanel';

export const metadata = {
  title: 'הודעות | ישיבת חדוותא',
};

export default function RabbiMessagesPage() {
  return (
    <MessagesManagementPanel description="הודעות השיעור והודעות המערכת. לחצו על הפלוס כדי לשלוח הודעה." />
  );
}
