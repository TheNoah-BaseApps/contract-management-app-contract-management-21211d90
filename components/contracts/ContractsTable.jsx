'use client';

import { useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/contracts/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ContractsTable({ contracts, onDelete, onView }) {
  const [deleteId, setDeleteId] = useState(null);

  const columns = [
    {
      header: 'Contract #',
      accessorKey: 'contract_number',
      cell: ({ row }) => (
        <span className="font-medium text-blue-600">{row.original.contract_number}</span>
      )
    },
    {
      header: 'Title',
      accessorKey: 'title',
      cell: ({ row }) => (
        <div className="max-w-xs truncate">{row.original.title}</div>
      )
    },
    {
      header: 'Counterparty',
      accessorKey: 'counterparty_name'
    },
    {
      header: 'Type',
      accessorKey: 'contract_type'
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
      header: 'Value',
      accessorKey: 'value',
      cell: ({ row }) => formatCurrency(row.original.value)
    },
    {
      header: 'Start Date',
      accessorKey: 'start_date',
      cell: ({ row }) => formatDate(row.original.start_date)
    },
    {
      header: 'End Date',
      accessorKey: 'end_date',
      cell: ({ row }) => formatDate(row.original.end_date)
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
      <DataTable columns={columns} data={contracts} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          onDelete(deleteId);
          setDeleteId(null);
        }}
        title="Delete Contract"
        description="Are you sure you want to delete this contract? This action cannot be undone."
      />
    </>
  );
}