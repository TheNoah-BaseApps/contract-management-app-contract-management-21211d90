import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/contract-renewals:
 *   get:
 *     summary: Get all contract renewals
 *     description: Retrieve a list of all contract renewals with optional filtering
 *     tags: [Contract Renewals]
 *     parameters:
 *       - in: query
 *         name: contract_id
 *         schema:
 *           type: string
 *         description: Filter by contract ID
 *       - in: query
 *         name: renewal_status
 *         schema:
 *           type: string
 *         description: Filter by renewal status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: Successfully retrieved contract renewals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 count:
 *                   type: integer
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const contract_id = searchParams.get('contract_id');
    const renewal_status = searchParams.get('renewal_status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM contract_renewals WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (contract_id) {
      sql += ` AND contract_id = $${paramIndex}`;
      params.push(contract_id);
      paramIndex++;
    }

    if (renewal_status) {
      sql += ` AND renewal_status = $${paramIndex}`;
      params.push(renewal_status);
      paramIndex++;
    }

    sql += ` ORDER BY renewal_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) FROM contract_renewals WHERE 1=1';
    const countParams = [];
    let countParamIndex = 1;

    if (contract_id) {
      countSql += ` AND contract_id = $${countParamIndex}`;
      countParams.push(contract_id);
      countParamIndex++;
    }

    if (renewal_status) {
      countSql += ` AND renewal_status = $${countParamIndex}`;
      countParams.push(renewal_status);
    }

    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: total
    });
  } catch (error) {
    console.error('Error fetching contract renewals:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-renewals:
 *   post:
 *     summary: Create a new contract renewal
 *     description: Create a new contract renewal record
 *     tags: [Contract Renewals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - renewal_id
 *               - contract_id
 *               - renewal_date
 *               - renewed_by
 *               - new_end_date
 *               - renewal_status
 *               - renewal_type
 *             properties:
 *               renewal_id:
 *                 type: string
 *               contract_id:
 *                 type: string
 *               renewal_date:
 *                 type: string
 *                 format: date-time
 *               renewed_by:
 *                 type: string
 *               new_end_date:
 *                 type: string
 *                 format: date-time
 *               terms_modified:
 *                 type: string
 *               renewal_status:
 *                 type: string
 *               renewal_type:
 *                 type: string
 *               renewal_approval_ref:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contract renewal created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      renewal_id,
      contract_id,
      renewal_date,
      renewed_by,
      new_end_date,
      terms_modified,
      renewal_status,
      renewal_type,
      renewal_approval_ref
    } = body;

    // Validation
    if (!renewal_id || !contract_id || !renewal_date || !renewed_by || !new_end_date || !renewal_status || !renewal_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO contract_renewals (
        renewal_id, contract_id, renewal_date, renewed_by,
        new_end_date, terms_modified, renewal_status, renewal_type,
        renewal_approval_ref, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `;

    const result = await query(sql, [
      renewal_id,
      contract_id,
      renewal_date,
      renewed_by,
      new_end_date,
      terms_modified || null,
      renewal_status,
      renewal_type,
      renewal_approval_ref || null
    ]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contract renewal:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}