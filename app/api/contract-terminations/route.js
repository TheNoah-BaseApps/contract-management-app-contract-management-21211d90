import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/contract-terminations:
 *   get:
 *     summary: Get all contract termination records
 *     description: Retrieve a list of all contract termination records with pagination
 *     tags: [Contract Termination]
 *     parameters:
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
 *         description: Successful response
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await query(
      'SELECT * FROM contract_terminations ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching contract termination records:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-terminations:
 *   post:
 *     summary: Create a new contract termination record
 *     description: Create a new contract termination entry
 *     tags: [Contract Termination]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - termination_id
 *               - contract_id
 *               - termination_date
 *               - termination_reason
 *               - terminated_by
 *               - termination_status
 *               - counterparty_notified
 *             properties:
 *               termination_id:
 *                 type: string
 *               contract_id:
 *                 type: string
 *               termination_date:
 *                 type: string
 *                 format: date-time
 *               termination_reason:
 *                 type: string
 *               terminated_by:
 *                 type: string
 *               termination_status:
 *                 type: string
 *               counterparty_notified:
 *                 type: boolean
 *               exit_clause_reference:
 *                 type: string
 *               settlement_details:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contract termination record created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      termination_id,
      contract_id,
      termination_date,
      termination_reason,
      terminated_by,
      termination_status,
      counterparty_notified,
      exit_clause_reference,
      settlement_details
    } = body;

    if (!termination_id || !contract_id || !termination_date || !termination_reason || !terminated_by || !termination_status || counterparty_notified === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO contract_terminations (
        termination_id, contract_id, termination_date, termination_reason,
        terminated_by, termination_status, counterparty_notified,
        exit_clause_reference, settlement_details, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING *`,
      [
        termination_id,
        contract_id,
        termination_date,
        termination_reason,
        terminated_by,
        termination_status,
        counterparty_notified,
        exit_clause_reference || null,
        settlement_details || null
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contract termination record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}