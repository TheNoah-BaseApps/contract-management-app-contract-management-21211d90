import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/contract-amendments:
 *   get:
 *     summary: Get all contract amendment records
 *     description: Retrieve a list of all contract amendment records with pagination
 *     tags: [Contract Amendment]
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
      'SELECT * FROM contract_amendments ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching contract amendment records:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-amendments:
 *   post:
 *     summary: Create a new contract amendment record
 *     description: Create a new contract amendment entry
 *     tags: [Contract Amendment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amendment_id
 *               - contract_id
 *               - amendment_date
 *               - amended_by
 *               - amendment_reason
 *               - amendment_status
 *               - legal_review_required
 *             properties:
 *               amendment_id:
 *                 type: string
 *               contract_id:
 *                 type: string
 *               amendment_date:
 *                 type: string
 *                 format: date-time
 *               amended_by:
 *                 type: string
 *               amendment_reason:
 *                 type: string
 *               clauses_amended:
 *                 type: string
 *               amendment_status:
 *                 type: string
 *               legal_review_required:
 *                 type: boolean
 *               amendment_document_ref:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contract amendment record created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      amendment_id,
      contract_id,
      amendment_date,
      amended_by,
      amendment_reason,
      clauses_amended,
      amendment_status,
      legal_review_required,
      amendment_document_ref
    } = body;

    if (!amendment_id || !contract_id || !amendment_date || !amended_by || !amendment_reason || !amendment_status || legal_review_required === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO contract_amendments (
        amendment_id, contract_id, amendment_date, amended_by, amendment_reason,
        clauses_amended, amendment_status, legal_review_required,
        amendment_document_ref, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING *`,
      [
        amendment_id,
        contract_id,
        amendment_date,
        amended_by,
        amendment_reason,
        clauses_amended || null,
        amendment_status,
        legal_review_required,
        amendment_document_ref || null
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contract amendment record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}