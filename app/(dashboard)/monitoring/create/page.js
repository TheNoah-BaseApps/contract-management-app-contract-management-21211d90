'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import MonitoringForm from '@/components/monitoring/MonitoringForm';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateMonitoringPage() {
  const router = useRouter();

  const handleSuccess = (record) => {
    toast.success('Monitoring record created successfully');
    router.push(`/monitoring/${record.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.push('/monitoring')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Monitoring
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Monitoring Record</h1>
          <p className="text-gray-500 mt-1">Record contract compliance and performance</p>
        </div>
      </div>

      <MonitoringForm onSuccess={handleSuccess} />
    </div>
  );
}