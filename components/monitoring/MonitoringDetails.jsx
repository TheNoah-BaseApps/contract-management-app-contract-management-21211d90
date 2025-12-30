'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/contracts/StatusBadge';
import { formatDate } from '@/lib/utils';
import { FileText, Calendar, User, AlertTriangle } from 'lucide-react';

export default function MonitoringDetails({ record }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText className="h-4 w-4" />
                Monitoring ID
              </div>
              <div className="font-medium">{record.monitoring_id}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                Monitoring Date
              </div>
              <div className="font-medium">{formatDate(record.monitoring_date)}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="h-4 w-4" />
                Monitored By
              </div>
              <div className="font-medium">{record.monitored_by}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <AlertTriangle className="h-4 w-4" />
                Compliance Status
              </div>
              <div><StatusBadge status={record.compliance_status} /></div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                Next Review Date
              </div>
              <div className="font-medium">{formatDate(record.next_review_date)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {record.performance_metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{record.performance_metrics}</div>
          </CardContent>
        </Card>
      )}

      {record.issues_identified && (
        <Card>
          <CardHeader>
            <CardTitle>Issues Identified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-red-700">{record.issues_identified}</div>
          </CardContent>
        </Card>
      )}

      {record.monitoring_notes && (
        <Card>
          <CardHeader>
            <CardTitle>Monitoring Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{record.monitoring_notes}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}