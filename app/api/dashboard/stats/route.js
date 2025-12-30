/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [
      totalContracts,
      activeContracts,
      expiringSoon,
      complianceAlerts,
      recentActivities
    ] = await Promise.all([
      query('SELECT COUNT(*) as count FROM contracts'),
      query("SELECT COUNT(*) as count FROM contracts WHERE status = 'Active'"),
      query("SELECT COUNT(*) as count FROM contracts WHERE status = 'Active' AND end_date <= CURRENT_DATE + INTERVAL '90 days'"),
      query("SELECT COUNT(*) as count FROM contract_monitoring WHERE compliance_status IN ('Non-Compliant', 'At Risk')"),
      query(`
        SELECT al.*, u.name as user_name
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.timestamp DESC
        LIMIT 10
      `)
    ]);

    const stats = {
      totalContracts: parseInt(totalContracts.rows[0].count),
      activeContracts: parseInt(activeContracts.rows[0].count),
      expiringSoon: parseInt(expiringSoon.rows[0].count),
      complianceAlerts: parseInt(complianceAlerts.rows[0].count),
      contractsTrend: 5,
      activeTrend: 3,
      expiringTrend: -2,
      alertsTrend: -1,
      statusDistribution: [],
      monthlyValue: [],
      recentActivities: recentActivities.rows
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}