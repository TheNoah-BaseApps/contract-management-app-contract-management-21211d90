/**
 * @swagger
 * /api/contract-monitoring:
 *   get:
 *     summary: Get all monitoring records
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create monitoring record
 *     tags: [Monitoring]
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

    const { searchParams } = new URL(request.url);
    const complianceStatus = searchParams.get('complianceStatus');

    let sql = 'SELECT * FROM contract_monitoring WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (complianceStatus) {
      paramCount++;
      sql += ` AND compliance_status = $${paramCount}`;
      params.push(complianceStatus);
    }

    sql += ' ORDER BY monitoring_date DESC';

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get monitoring records error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch monitoring records' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      monitoring_id,
      contract_id,
      monitoring_date,
      compliance_status,
      performance_metrics,
      issues_identified,
      next_review_date,
      monitoring_notes
    } = body;

    const result = await query(
      `INSERT INTO contract_monitoring (
        monitoring_id, contract_id, monitoring_date, monitored_by,
        monitored_by_id, compliance_status, performance_metrics,
        issues_identified, next_review_date, monitoring_notes,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *`,
      [
        monitoring_id,
        contract_id,
        monitoring_date,
        user.name,
        user.id,
        compliance_status,
        performance_metrics,
        issues_identified,
        next_review_date,
        monitoring_notes
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Monitoring record created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create monitoring record error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create monitoring record' },
      { status: 500 }
    );
  }
}