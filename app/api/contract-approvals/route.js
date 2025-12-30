import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/contract-approvals:
 *   get:
 *     summary: Get all contract approvals
 *     description: Retrieve list of all contract approvals with pagination and filtering
 *     tags:
 *       - Contract Approvals
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
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: approval_status
 *         schema:
 *           type: string
 *         description: Filter by approval status
 *       - in: query
 *         name: contract_id
 *         schema:
 *           type: string
 *         description: Filter by contract ID
 *     responses:
 *       200:
 *         description: List of contract approvals
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
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const approval_status = searchParams.get('approval_status');
    const contract_id = searchParams.get('contract_id');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM contract_approvals';
    let params = [];
    let countParams = [];
    const conditions = [];

    if (approval_status) {
      conditions.push(`approval_status = $${conditions.length + 1}`);
      params.push(approval_status);
      countParams.push(approval_status);
    }

    if (contract_id) {
      conditions.push(`contract_id = $${conditions.length + 1}`);
      params.push(contract_id);
      countParams.push(contract_id);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await query(queryText, params);

    let countQuery = 'SELECT COUNT(*) FROM contract_approvals';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching contract approvals:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-approvals:
 *   post:
 *     summary: Create a new contract approval
 *     description: Submit a new contract approval record
 *     tags:
 *       - Contract Approvals
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approval_id
 *               - contract_id
 *               - approver_name
 *               - approval_level
 *               - approval_status
 *             properties:
 *               approval_id:
 *                 type: string
 *               contract_id:
 *                 type: string
 *               approver_name:
 *                 type: string
 *               approval_level:
 *                 type: string
 *               approval_date:
 *                 type: string
 *                 format: date-time
 *               approval_status:
 *                 type: string
 *               comments:
 *                 type: string
 *               approval_document_ref:
 *                 type: string
 *               escalation_required:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Contract approval created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      approval_id,
      contract_id,
      approver_name,
      approval_level,
      approval_date,
      approval_status,
      comments,
      approval_document_ref,
      escalation_required
    } = body;

    if (!approval_id || !contract_id || !approver_name || !approval_level || !approval_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO contract_approvals 
       (approval_id, contract_id, approver_name, approval_level, approval_date, 
        approval_status, comments, approval_document_ref, escalation_required, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [approval_id, contract_id, approver_name, approval_level, approval_date,
       approval_status, comments, approval_document_ref, escalation_required || false]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contract approval:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}