/**
 * @swagger
 * /api/contract-drafts:
 *   get:
 *     summary: Get all contract drafts
 *     tags: [Drafts]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create new draft
 *     tags: [Drafts]
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
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM contract_drafts WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      sql += ` AND (draft_id ILIKE $${paramCount} OR drafter_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      sql += ` AND status = $${paramCount}`;
      params.push(status);
    }

    sql += ' ORDER BY draft_date DESC';

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get drafts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch drafts' },
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
      draft_id,
      contract_id,
      draft_version,
      terms_and_conditions,
      clauses_included,
      review_required,
      status
    } = body;

    const result = await query(
      `INSERT INTO contract_drafts (
        draft_id, contract_id, drafter_name, drafter_id, draft_date,
        draft_version, terms_and_conditions, clauses_included,
        review_required, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        draft_id,
        contract_id,
        user.name,
        user.id,
        draft_version,
        terms_and_conditions,
        clauses_included,
        review_required || false,
        status || 'Draft'
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Draft created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create draft error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create draft' },
      { status: 500 }
    );
  }
}