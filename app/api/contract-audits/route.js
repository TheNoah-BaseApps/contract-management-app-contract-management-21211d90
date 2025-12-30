import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/contract-audits:
 *   get:
 *     summary: Get all contract audits
 *     description: Retrieve a list of all contract audits with optional filtering
 *     tags: [Contract Audits]
 *     parameters:
 *       - in: query
 *         name: contract_id
 *         schema:
 *           type: string
 *         description: Filter by contract ID
 *       - in: query
 *         name: auditor_name
 *         schema:
 *           type: string
 *         description: Filter by auditor name
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
 *         description: Successfully retrieved contract audits
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
    const auditor_name = searchParams.get('auditor_name');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM contract_audits WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (contract_id) {
      sql += ` AND contract_id = $${paramIndex}`;
      params.push(contract_id);
      paramIndex++;
    }

    if (auditor_name) {
      sql += ` AND auditor_name ILIKE $${paramIndex}`;
      params.push(`%${auditor_name}%`);
      paramIndex++;
    }

    sql += ` ORDER BY audit_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) FROM contract_audits WHERE 1=1';
    const countParams = [];
    let countParamIndex = 1;

    if (contract_id) {
      countSql += ` AND contract_id = $${countParamIndex}`;
      countParams.push(contract_id);
      countParamIndex++;
    }

    if (auditor_name) {
      countSql += ` AND auditor_name ILIKE $${countParamIndex}`;
      countParams.push(`%${auditor_name}%`);
    }

    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: total
    });
  } catch (error) {
    console.error('Error fetching contract audits:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-audits:
 *   post:
 *     summary: Create a new contract audit
 *     description: Create a new contract audit record
 *     tags: [Contract Audits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - audit_id
 *               - contract_id
 *               - auditor_name
 *               - audit_date
 *             properties:
 *               audit_id:
 *                 type: string
 *               contract_id:
 *                 type: string
 *               auditor_name:
 *                 type: string
 *               audit_date:
 *                 type: string
 *                 format: date-time
 *               audit_scope:
 *                 type: string
 *               compliance_findings:
 *                 type: string
 *               discrepancies_found:
 *                 type: string
 *               corrective_actions_taken:
 *                 type: string
 *               audit_report_ref:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contract audit created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      audit_id,
      contract_id,
      auditor_name,
      audit_date,
      audit_scope,
      compliance_findings,
      discrepancies_found,
      corrective_actions_taken,
      audit_report_ref
    } = body;

    // Validation
    if (!audit_id || !contract_id || !auditor_name || !audit_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO contract_audits (
        audit_id, contract_id, auditor_name, audit_date,
        audit_scope, compliance_findings, discrepancies_found,
        corrective_actions_taken, audit_report_ref,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `;

    const result = await query(sql, [
      audit_id,
      contract_id,
      auditor_name,
      audit_date,
      audit_scope || null,
      compliance_findings || null,
      discrepancies_found || null,
      corrective_actions_taken || null,
      audit_report_ref || null
    ]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contract audit:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}