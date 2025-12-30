'use client';

import { useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/contracts/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function DraftsTable({ drafts, onDelete, onView }) {
  const [deleteId, setDeleteId] = useState(null);

  const columns = [
    {
      header: 'Draft ID',
      accessorKey: 'draft_id',
      cell: ({ row }) => (
        <span className="font-medium text-blue-600">{row.original.draft_id}</span>
      )
    },
    {
      header: 'Version',
      accessorKey: 'draft_version'
    },
    {
      header: 'Drafter',
      accessorKey: 'drafter_name'
    },
    {
      header: 'Draft Date',
      accessorKey: 'draft_date',
      cell: ({ row }) => formatDate(row.original.draft_date)
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
      header: 'Review Required',
      accessorKey: 'review_required',
      cell: ({ row }) => (
        row.original.review_required ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-gray-400" />
        )
      )
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
      <DataTable columns={columns} data={drafts} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          onDelete(deleteId);
          setDeleteId(null);
        }}
        title="Delete Draft"
        description="Are you sure you want to delete this draft? This action cannot be undone."
      />
    </>
  );
}