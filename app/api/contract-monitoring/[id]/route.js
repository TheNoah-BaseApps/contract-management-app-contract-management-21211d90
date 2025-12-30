/**
 * @swagger
 * /api/contract-monitoring/{id}:
 *   get:
 *     summary: Get monitoring record by ID
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await query(
      'SELECT * FROM contract_monitoring WHERE id = $1',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get monitoring record error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch record' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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
      compliance_status,
      performance_metrics,
      issues_identified,
      next_review_date,
      monitoring_notes
    } = body;

    const result = await query(
      `UPDATE contract_monitoring SET
        compliance_status = $1,
        performance_metrics = $2,
        issues_identified = $3,
        next_review_date = $4,
        monitoring_notes = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *`,
      [
        compliance_status,
        performance_metrics,
        issues_identified,
        next_review_date,
        monitoring_notes,
        params.id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Record updated successfully'
    });
  } catch (error) {
    console.error('Update monitoring record error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update record' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await query('DELETE FROM contract_monitoring WHERE id = $1', [params.id]);

    return NextResponse.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    console.error('Delete monitoring record error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete record' },
      { status: 500 }
    );
  }
}