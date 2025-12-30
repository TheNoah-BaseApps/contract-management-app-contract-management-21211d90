'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/contracts/StatusBadge';
import { formatDate } from '@/lib/utils';
import { FileText, Calendar, User, CheckCircle } from 'lucide-react';

export default function DraftDetails({ draft }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Draft Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText className="h-4 w-4" />
                Draft ID
              </div>
              <div className="font-medium">{draft.draft_id}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText className="h-4 w-4" />
                Version
              </div>
              <div className="font-medium">{draft.draft_version}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="h-4 w-4" />
                Drafter
              </div>
              <div className="font-medium">{draft.drafter_name}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                Draft Date
              </div>
              <div className="font-medium">{formatDate(draft.draft_date)}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText className="h-4 w-4" />
                Status
              </div>
              <div><StatusBadge status={draft.status} /></div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="h-4 w-4" />
                Review Required
              </div>
              <div className="font-medium">{draft.review_required ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap">{draft.terms_and_conditions}</div>
        </CardContent>
      </Card>

      {draft.clauses_included && (
        <Card>
          <CardHeader>
            <CardTitle>Clauses Included</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{draft.clauses_included}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}