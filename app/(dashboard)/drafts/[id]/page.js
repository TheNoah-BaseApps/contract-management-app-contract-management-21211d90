'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import DraftDetails from '@/components/drafts/DraftDetails';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowLeft, Edit } from 'lucide-react';

export default function DraftDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/contract-drafts/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch draft');

        const data = await res.json();
        if (data.success) {
          setDraft(data.data);
        } else {
          throw new Error(data.error || 'Draft not found');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchDraft();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !draft) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/drafts')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Drafts
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Draft not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push('/drafts')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Draft {draft.draft_version}</h1>
            <p className="text-gray-500 mt-1">ID: {draft.draft_id}</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/drafts/${params.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Draft
        </Button>
      </div>

      <DraftDetails draft={draft} />
    </div>
  );
}