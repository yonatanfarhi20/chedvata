import MessagesManagementPanel from '@/components/admin/messages/MessagesManagementPanel';

export const metadata = {
  title: 'הודעות | ישיבת חדוותא',
};

export default function RabbiMessagesPage() {
  return (
    <MessagesManagementPanel description="שלחו הודעה לתלמיד בשיעור שלכם, או לכל השיעור." />
  );
}
