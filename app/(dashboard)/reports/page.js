'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ComplianceReport from '@/components/reports/ComplianceReport';
import ExpiringContractsReport from '@/components/reports/ExpiringContractsReport';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Generate and export contract reports</p>
      </div>

      <Tabs defaultValue="compliance" className="w-full">
        <TabsList>
          <TabsTrigger value="compliance">Compliance Report</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Contracts</TabsTrigger>
        </TabsList>
        <TabsContent value="compliance" className="mt-6">
          <ComplianceReport />
        </TabsContent>
        <TabsContent value="expiring" className="mt-6">
          <ExpiringContractsReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}