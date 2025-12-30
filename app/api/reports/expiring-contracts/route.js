/**
 * @swagger
 * /api/reports/expiring-contracts:
 *   get:
 *     summary: Get contracts nearing expiration
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
        contract_number,
        title,
        counterparty_name,
        value,
        end_date,
        end_date - CURRENT_DATE as days_until_expiry
      FROM contracts
      WHERE status = 'Active'
        AND end_date <= CURRENT_DATE + INTERVAL '90 days'
        AND end_date >= CURRENT_DATE
      ORDER BY end_date ASC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get expiring contracts report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}