'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ExportButton from '@/components/reports/ExportButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/contracts/StatusBadge';
import { formatDate } from '@/lib/utils';

export default function ComplianceReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/reports/compliance', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch compliance report');

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
      header: 'Compliance Status',
      accessorKey: 'compliance_status',
      cell: ({ row }) => <StatusBadge status={row.original.compliance_status} />
    },
    {
      header: 'Last Monitored',
      accessorKey: 'monitoring_date',
      cell: ({ row }) => formatDate(row.original.monitoring_date)
    },
    {
      header: 'Next Review',
      accessorKey: 'next_review_date',
      cell: ({ row }) => formatDate(row.original.next_review_date)
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
        <CardTitle>Compliance Report</CardTitle>
        <ExportButton data={data} filename="compliance-report" />
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} />
      </CardContent>
    </Card>
  );
}