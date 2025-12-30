'use client';

import { useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/contracts/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Eye, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function MonitoringTable({ records, onDelete, onView }) {
  const [deleteId, setDeleteId] = useState(null);

  const columns = [
    {
      header: 'Monitoring ID',
      accessorKey: 'monitoring_id',
      cell: ({ row }) => (
        <span className="font-medium text-blue-600">{row.original.monitoring_id}</span>
      )
    },
    {
      header: 'Monitoring Date',
      accessorKey: 'monitoring_date',
      cell: ({ row }) => formatDate(row.original.monitoring_date)
    },
    {
      header: 'Monitored By',
      accessorKey: 'monitored_by'
    },
    {
      header: 'Compliance Status',
      accessorKey: 'compliance_status',
      cell: ({ row }) => <StatusBadge status={row.original.compliance_status} />
    },
    {
      header: 'Next Review',
      accessorKey: 'next_review_date',
      cell: ({ row }) => formatDate(row.original.next_review_date)
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(row.original.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(row.original.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <DataTable columns={columns} data={records} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          onDelete(deleteId);
          setDeleteId(null);
        }}
        title="Delete Monitoring Record"
        description="Are you sure you want to delete this monitoring record? This action cannot be undone."
      />
    </>
  );
}