'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/dashboard/StatCard';
import ChartWidget from '@/components/dashboard/ChartWidget';
import RecentActivities from '@/components/dashboard/RecentActivities';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch dashboard stats');

        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error(data.error || 'Failed to load stats');
        }
      } catch (err) {
        console.error('Dashboard stats error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Contract management overview and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Contracts"
          value={stats?.totalContracts || 0}
          icon={FileText}
          trend={stats?.contractsTrend}
          color="blue"
        />
        <StatCard
          title="Active Contracts"
          value={stats?.activeContracts || 0}
          icon={CheckCircle}
          trend={stats?.activeTrend}
          color="green"
        />
        <StatCard
          title="Expiring Soon"
          value={stats?.expiringSoon || 0}
          icon={Clock}
          trend={stats?.expiringTrend}
          color="orange"
        />
        <StatCard
          title="Compliance Alerts"
          value={stats?.complianceAlerts || 0}
          icon={AlertTriangle}
          trend={stats?.alertsTrend}
          color="red"
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/contract-requests">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Contract Requests</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Submit and track contract requests</p>
                {stats?.pendingRequests !== undefined && (
                  <p className="text-xs text-gray-400 mt-2">
                    {stats.pendingRequests} pending requests
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/contract-approvals">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Contract Approvals</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Manage contract approval workflow</p>
                {stats?.pendingApprovals !== undefined && (
                  <p className="text-xs text-gray-400 mt-2">
                    {stats.pendingApprovals} pending approvals
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget
          title="Contract Status Distribution"
          data={stats?.statusDistribution || []}
          type="pie"
        />
        <ChartWidget
          title="Monthly Contract Value"
          data={stats?.monthlyValue || []}
          type="bar"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivities activities={stats?.recentActivities || []} />
        </CardContent>
      </Card>
    </div>
  );
}