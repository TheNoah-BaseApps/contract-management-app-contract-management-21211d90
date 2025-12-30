/**
 * @swagger
 * /api/contracts/{id}:
 *   get:
 *     summary: Get contract by ID
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';

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
      'SELECT * FROM contracts WHERE id = $1',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get contract error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contract' },
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
      contract_number,
      title,
      counterparty_name,
      contract_type,
      status,
      start_date,
      end_date,
      value
    } = body;

    const result = await query(
      `UPDATE contracts SET
        contract_number = $1,
        title = $2,
        counterparty_name = $3,
        contract_type = $4,
        status = $5,
        start_date = $6,
        end_date = $7,
        value = $8,
        updated_at = NOW()
      WHERE id = $9
      RETURNING *`,
      [
        contract_number,
        title,
        counterparty_name,
        contract_type,
        status,
        start_date,
        end_date,
        value,
        params.id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    await createAuditLog({
      contract_id: params.id,
      user_id: user.id,
      action: 'Update',
      description: `Contract ${contract_number} updated`,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Contract updated successfully'
    });
  } catch (error) {
    console.error('Update contract error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update contract' },
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

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const existing = await query(
      'SELECT contract_number FROM contracts WHERE id = $1',
      [params.id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    await query('DELETE FROM contracts WHERE id = $1', [params.id]);

    await createAuditLog({
      contract_id: params.id,
      user_id: user.id,
      action: 'Delete',
      description: `Contract ${existing.rows[0].contract_number} deleted`,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: 'Contract deleted successfully'
    });
  } catch (error) {
    console.error('Delete contract error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete contract' },
      { status: 500 }
    );
  }
}