'use client';

import React from 'react';
import { NavigationHeader } from '@/components/nomi/NavigationHeader';
import { MobileBottomNav } from '@/components/nomi/MobileBottomNav';
import { Footer } from '@/components/nomi/Footer';
import { useNomi } from '@/lib/store/nomiStore';
import { AuthGuard } from '@/components/nomi/AuthGuard';
import { Activity, PlusCircle, Edit3, Trash2, CheckCircle2, UserPlus, UserMinus } from 'lucide-react';
import { EmptyState } from '@/components/nomi/EmptyState';
import { ActivityLog } from '@/lib/types/nomi';

const LOG_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  expense_added: PlusCircle,
  expense_edited: Edit3,
  expense_deleted: Trash2,
  settlement_created: CheckCircle2,
  member_added: UserPlus,
  member_removed: UserMinus,
};

const LOG_COLORS: Record<string, string> = {
  expense_added: 'bg-nomi-primary-soft text-nomi-primary',
  expense_edited: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  expense_deleted: 'bg-nomi-negative-soft text-nomi-negative',
  settlement_created: 'bg-nomi-positive-soft text-nomi-positive',
  member_added: 'bg-nomi-primary-soft text-nomi-primary',
  member_removed: 'bg-nomi-negative-soft text-nomi-negative',
};

function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Group activity logs by date
function groupByDate(logs: ActivityLog[]) {
  const groups: { label: string; logs: ActivityLog[] }[] = [];
  const seen: Record<string, number> = {};

  for (const log of logs) {
    const d = new Date(log.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);

    let label: string;
    if (diffDays === 0) label = 'Today';
    else if (diffDays === 1) label = 'Yesterday';
    else if (diffDays < 7) label = d.toLocaleDateString('en-IN', { weekday: 'long' });
    else label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    if (label in seen) {
      groups[seen[label]].logs.push(log);
    } else {
      seen[label] = groups.length;
      groups.push({ label, logs: [log] });
    }
  }
  return groups;
}

export default function ActivityPage() {
  const { activityLogs, groups } = useNomi();

  const getGroupName = (gId?: string) => {
    if (!gId) return null;
    return groups.find((g) => g.id === gId)?.name;
  };

  const groupedLogs = groupByDate(activityLogs);

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-nomi-bg text-nomi-main pb-20 md:pb-0">
      <NavigationHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-nomi-main">Activity Feed</h1>
          <p className="text-xs sm:text-sm text-nomi-secondary mt-1">
            A chronological history of your shared expenses and settlements.
          </p>
        </div>

        {activityLogs.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Recent expenses, settlements, and group changes will appear here."
          />
        ) : (
          <div className="space-y-6">
            {groupedLogs.map(({ label, logs }) => (
              <div key={label}>
                {/* Date separator */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-nomi-secondary uppercase tracking-wider whitespace-nowrap">
                    {label}
                  </span>
                  <div className="flex-1 h-px bg-nomi-surface border-t border-nomi" />
                </div>

                <div className="p-1 rounded-3xl bg-nomi-surface border border-nomi shadow-sm divide-y divide-nomi">
                  {logs.map((log) => {
                    const Icon = LOG_ICONS[log.type] || Activity;
                    const colorClass = LOG_COLORS[log.type] || 'bg-nomi-primary-soft text-nomi-primary';
                    const groupName = getGroupName(log.groupId);

                    return (
                      <div key={log.id} className="py-4 px-5 first:rounded-t-2xl last:rounded-b-2xl flex items-start gap-4">
                        <div className={`p-2.5 rounded-2xl ${colorClass} shrink-0 mt-0.5`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-nomi-main">
                            <strong className="font-poppins font-semibold">{log.actorName}</strong>{' '}
                            {log.description}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-nomi-secondary mt-1">
                            {groupName && (
                              <span className="font-medium text-nomi-primary bg-nomi-primary-soft/60 px-2 py-0.5 rounded-md">
                                {groupName}
                              </span>
                            )}
                            <span>{formatRelativeDate(log.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <MobileBottomNav />
      <Footer />
      </div>
    </AuthGuard>
  );
}
