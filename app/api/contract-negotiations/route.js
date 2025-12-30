import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/contract-negotiations:
 *   get:
 *     summary: Get all contract negotiations
 *     description: Retrieve a list of all contract negotiations with pagination
 *     tags: [Contract Negotiations]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by negotiation status
 *     responses:
 *       200:
 *         description: Successfully retrieved contract negotiations
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
 *                 pagination:
 *                   type: object
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM contract_negotiations';
    let params = [];
    
    if (status) {
      queryText += ' WHERE negotiation_status = $1';
      params.push(status);
      queryText += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      queryText += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2';
      params = [limit, offset];
    }

    const result = await query(queryText, params);

    const countQuery = status 
      ? 'SELECT COUNT(*) FROM contract_negotiations WHERE negotiation_status = $1'
      : 'SELECT COUNT(*) FROM contract_negotiations';
    const countResult = await query(countQuery, status ? [status] : []);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching contract negotiations:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-negotiations:
 *   post:
 *     summary: Create a new contract negotiation
 *     description: Create a new contract negotiation record
 *     tags: [Contract Negotiations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - negotiation_id
 *               - contract_id
 *               - negotiation_start_date
 *               - negotiation_status
 *             properties:
 *               negotiation_id:
 *                 type: string
 *               contract_id:
 *                 type: string
 *               negotiation_start_date:
 *                 type: string
 *                 format: date-time
 *               negotiation_end_date:
 *                 type: string
 *                 format: date-time
 *               negotiation_status:
 *                 type: string
 *               internal_stakeholders:
 *                 type: string
 *               external_parties:
 *                 type: string
 *               major_changes_made:
 *                 type: string
 *               negotiation_mode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contract negotiation created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      negotiation_id,
      contract_id,
      negotiation_start_date,
      negotiation_end_date,
      negotiation_status,
      internal_stakeholders,
      external_parties,
      major_changes_made,
      negotiation_mode
    } = body;

    if (!negotiation_id || !contract_id || !negotiation_start_date || !negotiation_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO contract_negotiations 
       (negotiation_id, contract_id, negotiation_start_date, negotiation_end_date, 
        negotiation_status, internal_stakeholders, external_parties, major_changes_made, 
        negotiation_mode, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [
        negotiation_id,
        contract_id,
        negotiation_start_date,
        negotiation_end_date || null,
        negotiation_status,
        internal_stakeholders || null,
        external_parties || null,
        major_changes_made || null,
        negotiation_mode || null
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contract negotiation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}