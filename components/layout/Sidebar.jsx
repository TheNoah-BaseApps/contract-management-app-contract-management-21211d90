'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  FileEdit,
  Activity,
  FolderOpen,
  ScrollText,
  BarChart3,
  User,
  CheckCircle,
  Users,
  FileCheck,
  ClipboardCheck,
  RefreshCw,
  ClipboardList,
  Shield
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Contracts', href: '/contracts', icon: FileText },
  { name: 'Contract Requests', href: '/contract-requests', icon: FileText },
  { name: 'Contract Approvals', href: '/contract-approvals', icon: CheckCircle },
  { name: 'Contract Negotiations', href: '/contract-negotiations', icon: Users },
  { name: 'Contract Executions', href: '/contract-executions', icon: FileCheck },
  { name: 'Contract Obligations', href: '/contract-obligations', icon: ClipboardList },
  { name: 'Contract Compliance', href: '/contract-compliance', icon: Shield },
  { name: 'Contract Audits', href: '/contract-audits', icon: ClipboardCheck },
  { name: 'Contract Renewals', href: '/contract-renewals', icon: RefreshCw },
  { name: 'Drafts', href: '/drafts', icon: FileEdit },
  { name: 'Monitoring', href: '/monitoring', icon: Activity },
  { name: 'Documents', href: '/documents', icon: FolderOpen },
  { name: 'Audit Logs', href: '/audit-logs', icon: ScrollText },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Sidebar({ open, currentPath }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 w-64'
        )}
      >
        <nav className="h-full overflow-y-auto p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = currentPath === item.href || currentPath?.startsWith(item.href + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => {}}
        />
      )}
    </>
  );
}