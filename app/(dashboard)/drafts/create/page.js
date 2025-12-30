'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import DraftForm from '@/components/drafts/DraftForm';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateDraftPage() {
  const router = useRouter();

  const handleSuccess = (draft) => {
    toast.success('Draft created successfully');
    router.push(`/drafts/${draft.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.push('/drafts')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Drafts
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Draft</h1>
          <p className="text-gray-500 mt-1">Draft a new contract version</p>
        </div>
      </div>

      <DraftForm onSuccess={handleSuccess} />
    </div>
  );
}