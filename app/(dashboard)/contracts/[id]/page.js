'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContractDetails from '@/components/contracts/ContractDetails';
import DocumentList from '@/components/documents/DocumentList';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowLeft, Edit } from 'lucide-react';

export default function ContractDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [contract, setContract] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const [contractRes, docsRes] = await Promise.all([
          fetch(`/api/contracts/${params.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`/api/documents/contract/${params.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!contractRes.ok) throw new Error('Failed to fetch contract');

        const contractData = await contractRes.json();
        const docsData = await docsRes.json();

        if (contractData.success) {
          setContract(contractData.data);
        }
        if (docsData.success) {
          setDocuments(docsData.data || []);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/contracts')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contracts
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Contract not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push('/contracts')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{contract.title}</h1>
            <p className="text-gray-500 mt-1">Contract #{contract.contract_number}</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/contracts/${params.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Contract
        </Button>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-6">
          <ContractDetails contract={contract} />
        </TabsContent>
        <TabsContent value="documents" className="mt-6">
          <DocumentList documents={documents} contractId={params.id} />
        </TabsContent>
        <TabsContent value="monitoring" className="mt-6">
          <div className="text-center py-12 text-gray-500">
            Monitoring records will appear here
          </div>
        </TabsContent>
        <TabsContent value="drafts" className="mt-6">
          <div className="text-center py-12 text-gray-500">
            Contract drafts will appear here
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}