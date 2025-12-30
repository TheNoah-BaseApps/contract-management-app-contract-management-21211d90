'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart } from 'lucide-react';

export default function ChartWidget({ title, data, type = 'bar' }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === 'bar' ? <BarChart3 className="h-5 w-5" /> : <PieChart className="h-5 w-5" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-gray-400">
          Chart visualization would be rendered here with a library like Recharts
        </div>
      </CardContent>
    </Card>
  );
}