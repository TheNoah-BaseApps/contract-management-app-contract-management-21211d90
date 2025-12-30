/**
 * @swagger
 * /api/contract-drafts/{id}:
 *   get:
 *     summary: Get draft by ID
 *     tags: [Drafts]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update draft
 *     tags: [Drafts]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete draft
 *     tags: [Drafts]
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
      'SELECT * FROM contract_drafts WHERE id = $1',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Draft not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get draft error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch draft' },
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
      draft_version,
      terms_and_conditions,
      clauses_included,
      review_required,
      status
    } = body;

    const result = await query(
      `UPDATE contract_drafts SET
        draft_version = $1,
        terms_and_conditions = $2,
        clauses_included = $3,
        review_required = $4,
        status = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *`,
      [
        draft_version,
        terms_and_conditions,
        clauses_included,
        review_required,
        status,
        params.id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Draft not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Draft updated successfully'
    });
  } catch (error) {
    console.error('Update draft error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update draft' },
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

    await query('DELETE FROM contract_drafts WHERE id = $1', [params.id]);

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully'
    });
  } catch (error) {
    console.error('Delete draft error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}