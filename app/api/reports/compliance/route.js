/**
 * @swagger
 * /api/reports/compliance:
 *   get:
 *     summary: Generate compliance report
 *     tags: [Reports]
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

    const result = await query(`
      SELECT 
        c.contract_number,
        c.title,
        cm.compliance_status,
        cm.monitoring_date,
        cm.next_review_date
      FROM contracts c
      LEFT JOIN contract_monitoring cm ON c.id = cm.contract_id
      WHERE c.status = 'Active'
      ORDER BY cm.monitoring_date DESC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get compliance report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}