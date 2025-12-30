'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ExportButton from '@/components/reports/ExportButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/contracts/StatusBadge';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function ExpiringContractsReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/reports/expiring-contracts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch expiring contracts report');

        const result = await res.json();
        if (result.success) {
          setData(result.data || []);
        }
      } catch (err) {
        console.error('Fetch report error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const columns = [
    {
      header: 'Contract Number',
      accessorKey: 'contract_number'
    },
    {
      header: 'Title',
      accessorKey: 'title'
    },
    {
      header: 'Counterparty',
      accessorKey: 'counterparty_name'
    },
    {
      header: 'Value',
      accessorKey: 'value',
      cell: ({ row }) => formatCurrency(row.original.value)
    },
    {
      header: 'End Date',
      accessorKey: 'end_date',
      cell: ({ row }) => formatDate(row.original.end_date)
    },
    {
      header: 'Days Until Expiry',
      accessorKey: 'days_until_expiry',
      cell: ({ row }) => (
        <span className="font-medium text-orange-600">
          {row.original.days_until_expiry} days
        </span>
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Expiring Contracts Report</CardTitle>
        <ExportButton data={data} filename="expiring-contracts-report" />
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} />
      </CardContent>
    </Card>
  );
}