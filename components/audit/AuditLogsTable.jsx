'use client';

import DataTable from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { FileText, User, Clock } from 'lucide-react';

export default function AuditLogsTable({ logs }) {
  const columns = [
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          {formatDate(row.original.timestamp)}
        </div>
      )
    },
    {
      header: 'User',
      accessorKey: 'user_name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          {row.original.user_name || 'System'}
        </div>
      )
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {row.original.action}
        </Badge>
      )
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ row }) => (
        <div className="max-w-md truncate">{row.original.description}</div>
      )
    },
    {
      header: 'IP Address',
      accessorKey: 'ip_address'
    }
  ];

  return <DataTable columns={columns} data={logs} />;
}