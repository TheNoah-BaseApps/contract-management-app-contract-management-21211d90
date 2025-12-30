import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/contract-obligations:
 *   get:
 *     summary: Get all contract obligations
 *     description: Retrieve a list of all contract obligations with optional filtering
 *     tags: [Contract Obligations]
 *     parameters:
 *       - in: query
 *         name: contract_id
 *         schema:
 *           type: string
 *         description: Filter by contract ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by fulfillment status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: List of contract obligations
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
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const contract_id = searchParams.get('contract_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM contract_obligations WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (contract_id) {
      sql += ` AND contract_id = $${paramIndex}`;
      params.push(contract_id);
      paramIndex++;
    }

    if (status) {
      sql += ` AND fulfillment_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching contract obligations:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-obligations:
 *   post:
 *     summary: Create a new contract obligation
 *     description: Create a new contract obligation record
 *     tags: [Contract Obligations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - obligation_id
 *               - contract_id
 *               - obligation_title
 *               - responsible_party
 *               - due_date
 *               - fulfillment_status
 *             properties:
 *               obligation_id:
 *                 type: string
 *               contract_id:
 *                 type: string
 *               obligation_title:
 *                 type: string
 *               obligation_details:
 *                 type: string
 *               responsible_party:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               fulfillment_status:
 *                 type: string
 *               fulfillment_date:
 *                 type: string
 *                 format: date-time
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contract obligation created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      obligation_id,
      contract_id,
      obligation_title,
      obligation_details,
      responsible_party,
      due_date,
      fulfillment_status,
      fulfillment_date,
      remarks
    } = body;

    // Validation
    if (!obligation_id || !contract_id || !obligation_title || !responsible_party || !due_date || !fulfillment_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO contract_obligations (
        obligation_id, contract_id, obligation_title, obligation_details,
        responsible_party, due_date, fulfillment_status, fulfillment_date,
        remarks, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `;

    const result = await query(sql, [
      obligation_id,
      contract_id,
      obligation_title,
      obligation_details || null,
      responsible_party,
      due_date,
      fulfillment_status,
      fulfillment_date || null,
      remarks || null
    ]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contract obligation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}