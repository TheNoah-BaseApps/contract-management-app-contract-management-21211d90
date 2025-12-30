'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ContractForm from '@/components/contracts/ContractForm';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateContractPage() {
  const router = useRouter();

  const handleSuccess = (contract) => {
    toast.success('Contract created successfully');
    router.push(`/contracts/${contract.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.push('/contracts')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contracts
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Contract</h1>
          <p className="text-gray-500 mt-1">Enter contract details and information</p>
        </div>
      </div>

      <ContractForm onSuccess={handleSuccess} />
    </div>
  );
}