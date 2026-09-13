'use client';

import { useState } from 'react';
import DepositedList from '@/components/admin/phone-penalties/DepositedList';
import PendingDepositList from '@/components/admin/phone-penalties/PendingDepositList';
import ReadyForReturnList from '@/components/admin/phone-penalties/ReadyForReturnList';
import RequireAuth from '@/components/auth/RequireAuth';
import { PHONE_DEPOSIT_STATUS, PHONE_PENALTY_TABS } from '@/lib/admin/phonePenalties';
import { SENIOR_MANAGEMENT_ROLES } from '@/lib/auth/constants';

function PhonePenaltiesContent() {
  const [activeTab, setActiveTab] = useState(PHONE_DEPOSIT_STATUS.PENDING_DEPOSIT);
  const [pendingDeposit] = useState([]);
  const [deposited] = useState([]);
  const [readyForReturn] = useState([]);
  const [busyStudentId] = useState('');

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background p-4 md:p-8">
      <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col">
        <header className="mb-6 shrink-0">
          <h1 className="text-xl font-semibold text-foreground">ניהול הפקדת טלפונים</h1>
          <p className="mt-1 text-sm text-muted">
            מעקב אחר תלמידים שחייבים בהפקדת מכשיר בעקבות חריגה מכללי הנוכחות בתפילות.
          </p>
        </header>

        <div className="mb-4 flex shrink-0 gap-2 border-b border-border" role="tablist" aria-label="רשימות הפקדת טלפונים">
          {PHONE_PENALTY_TABS.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`phone-penalty-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`phone-penalty-panel-${tab.id}`}
                className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'border border-b-0 border-border bg-card text-foreground'
                    : 'text-muted hover:text-foreground'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {PHONE_PENALTY_TABS.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <div
              key={tab.id}
              id={`phone-penalty-panel-${tab.id}`}
              role="tabpanel"
              aria-labelledby={`phone-penalty-tab-${tab.id}`}
              hidden={!isActive}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              {isActive && tab.id === PHONE_DEPOSIT_STATUS.PENDING_DEPOSIT ? (
                <PendingDepositList
                  students={pendingDeposit}
                  busyStudentId={busyStudentId}
                  onConfirmDeposit={() => {}}
                />
              ) : null}
              {isActive && tab.id === PHONE_DEPOSIT_STATUS.DEPOSITED ? (
                <DepositedList students={deposited} />
              ) : null}
              {isActive && tab.id === PHONE_DEPOSIT_STATUS.READY_FOR_RETURN ? (
                <ReadyForReturnList
                  students={readyForReturn}
                  busyStudentId={busyStudentId}
                  onConfirmReturn={() => {}}
                />
              ) : null}
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default function PhonePenaltiesPanel() {
  return (
    <RequireAuth allowedRoles={[...SENIOR_MANAGEMENT_ROLES]}>
      <PhonePenaltiesContent />
    </RequireAuth>
  );
}
