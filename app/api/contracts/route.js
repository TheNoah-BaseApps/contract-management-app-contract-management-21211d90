/**
 * @swagger
 * /api/contracts:
 *   get:
 *     summary: Get all contracts
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create new contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';

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
    const type = searchParams.get('type');

    let sql = 'SELECT * FROM contracts WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      sql += ` AND (contract_number ILIKE $${paramCount} OR title ILIKE $${paramCount} OR counterparty_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      sql += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (type) {
      paramCount++;
      sql += ` AND contract_type = $${paramCount}`;
      params.push(type);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get contracts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contracts' },
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
      contract_number,
      title,
      counterparty_name,
      contract_type,
      status,
      start_date,
      end_date,
      value
    } = body;

    if (!contract_number || !title || !counterparty_name || !contract_type || !start_date || !end_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO contracts (
        contract_number, title, counterparty_name, contract_type, status,
        start_date, end_date, value, owner_id, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *`,
      [
        contract_number,
        title,
        counterparty_name,
        contract_type,
        status || 'Draft',
        start_date,
        end_date,
        value || 0,
        user.id,
        user.id
      ]
    );

    await createAuditLog({
      contract_id: result.rows[0].id,
      user_id: user.id,
      action: 'Create',
      description: `Contract ${contract_number} created`,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Contract created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create contract error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create contract' },
      { status: 500 }
    );
  }
}