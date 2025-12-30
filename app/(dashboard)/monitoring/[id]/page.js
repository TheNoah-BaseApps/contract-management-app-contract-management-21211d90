'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import MonitoringDetails from '@/components/monitoring/MonitoringDetails';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowLeft, Edit } from 'lucide-react';

export default function MonitoringDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/contract-monitoring/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch monitoring record');

        const data = await res.json();
        if (data.success) {
          setRecord(data.data);
        } else {
          throw new Error(data.error || 'Record not found');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRecord();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/monitoring')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Monitoring
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Record not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push('/monitoring')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Monitoring Record</h1>
            <p className="text-gray-500 mt-1">ID: {record.monitoring_id}</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/monitoring/${params.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Record
        </Button>
      </div>

      <MonitoringDetails record={record} />
    </div>
  );
}