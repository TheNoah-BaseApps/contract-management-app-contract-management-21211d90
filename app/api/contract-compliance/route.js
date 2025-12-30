import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/contract-compliance:
 *   get:
 *     summary: Get all contract compliance records
 *     description: Retrieve a list of all contract compliance checks with optional filtering
 *     tags: [Contract Compliance]
 *     parameters:
 *       - in: query
 *         name: contract_id
 *         schema:
 *           type: string
 *         description: Filter by contract ID
 *       - in: query
 *         name: result
 *         schema:
 *           type: string
 *         description: Filter by compliance result
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
 *         description: List of contract compliance records
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
    const result = searchParams.get('result');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM contract_compliance WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (contract_id) {
      sql += ` AND contract_id = $${paramIndex}`;
      params.push(contract_id);
      paramIndex++;
    }

    if (result) {
      sql += ` AND compliance_result = $${paramIndex}`;
      params.push(result);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const queryResult = await query(sql, params);
    
    return NextResponse.json({ 
      success: true, 
      data: queryResult.rows,
      count: queryResult.rows.length
    });
  } catch (error) {
    console.error('Error fetching contract compliance records:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-compliance:
 *   post:
 *     summary: Create a new contract compliance record
 *     description: Create a new contract compliance check record
 *     tags: [Contract Compliance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - compliance_id
 *               - contract_id
 *               - compliance_check_date
 *               - compliance_officer
 *               - compliance_result
 *             properties:
 *               compliance_id:
 *                 type: string
 *               contract_id:
 *                 type: string
 *               compliance_check_date:
 *                 type: string
 *                 format: date-time
 *               compliance_officer:
 *                 type: string
 *               compliance_result:
 *                 type: string
 *               non_compliance_issues:
 *                 type: string
 *               corrective_actions:
 *                 type: string
 *               follow_up_date:
 *                 type: string
 *                 format: date-time
 *               audit_trail_ref:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contract compliance record created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      compliance_id,
      contract_id,
      compliance_check_date,
      compliance_officer,
      compliance_result,
      non_compliance_issues,
      corrective_actions,
      follow_up_date,
      audit_trail_ref
    } = body;

    // Validation
    if (!compliance_id || !contract_id || !compliance_check_date || !compliance_officer || !compliance_result) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO contract_compliance (
        compliance_id, contract_id, compliance_check_date, compliance_officer,
        compliance_result, non_compliance_issues, corrective_actions,
        follow_up_date, audit_trail_ref, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `;

    const queryResult = await query(sql, [
      compliance_id,
      contract_id,
      compliance_check_date,
      compliance_officer,
      compliance_result,
      non_compliance_issues || null,
      corrective_actions || null,
      follow_up_date || null,
      audit_trail_ref || null
    ]);

    return NextResponse.json(
      { success: true, data: queryResult.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contract compliance record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}