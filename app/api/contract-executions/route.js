import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/contract-executions:
 *   get:
 *     summary: Get all contract executions
 *     description: Retrieve a list of all contract executions with pagination
 *     tags: [Contract Executions]
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
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Successfully retrieved contract executions
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

    let queryText = 'SELECT * FROM contract_executions';
    let params = [];
    
    if (status) {
      queryText += ' WHERE status = $1';
      params.push(status);
      queryText += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      queryText += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2';
      params = [limit, offset];
    }

    const result = await query(queryText, params);

    const countQuery = status 
      ? 'SELECT COUNT(*) FROM contract_executions WHERE status = $1'
      : 'SELECT COUNT(*) FROM contract_executions';
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
    console.error('Error fetching contract executions:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-executions:
 *   post:
 *     summary: Create a new contract execution
 *     description: Create a new contract execution record
 *     tags: [Contract Executions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contract_id
 *               - contract_title
 *               - contract_type
 *               - initiating_department
 *               - effective_date
 *               - status
 *             properties:
 *               contract_id:
 *                 type: string
 *               contract_title:
 *                 type: string
 *               contract_type:
 *                 type: string
 *               contract_parties:
 *                 type: string
 *               contract_owner_id:
 *                 type: string
 *               initiating_department:
 *                 type: string
 *               effective_date:
 *                 type: string
 *                 format: date-time
 *               expiry_date:
 *                 type: string
 *                 format: date-time
 *               contract_value:
 *                 type: string
 *               payment_terms:
 *                 type: string
 *               status:
 *                 type: string
 *               signing_date:
 *                 type: string
 *                 format: date-time
 *               execution_date:
 *                 type: string
 *                 format: date-time
 *               signed_by_internal:
 *                 type: string
 *               signed_by_external:
 *                 type: string
 *               contract_documents:
 *                 type: string
 *               contract_terms:
 *                 type: string
 *               obligations_summary:
 *                 type: string
 *               renewal_clause:
 *                 type: string
 *               termination_clause:
 *                 type: string
 *               compliance_requirements:
 *                 type: string
 *               confidentiality_level:
 *                 type: string
 *               audit_trail:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contract execution created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      contract_id,
      contract_title,
      contract_type,
      contract_parties,
      contract_owner_id,
      initiating_department,
      effective_date,
      expiry_date,
      contract_value,
      payment_terms,
      status,
      signing_date,
      execution_date,
      signed_by_internal,
      signed_by_external,
      contract_documents,
      contract_terms,
      obligations_summary,
      renewal_clause,
      termination_clause,
      compliance_requirements,
      confidentiality_level,
      audit_trail,
      remarks
    } = body;

    if (!contract_id || !contract_title || !contract_type || !initiating_department || !effective_date || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO contract_executions 
       (contract_id, contract_title, contract_type, contract_parties, contract_owner_id,
        initiating_department, effective_date, expiry_date, contract_value, payment_terms,
        status, signing_date, execution_date, signed_by_internal, signed_by_external,
        contract_documents, contract_terms, obligations_summary, renewal_clause,
        termination_clause, compliance_requirements, confidentiality_level, audit_trail,
        remarks, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW(), NOW())
       RETURNING *`,
      [
        contract_id,
        contract_title,
        contract_type,
        contract_parties || null,
        contract_owner_id || null,
        initiating_department,
        effective_date,
        expiry_date || null,
        contract_value || null,
        payment_terms || null,
        status,
        signing_date || null,
        execution_date || null,
        signed_by_internal || null,
        signed_by_external || null,
        contract_documents || null,
        contract_terms || null,
        obligations_summary || null,
        renewal_clause || null,
        termination_clause || null,
        compliance_requirements || null,
        confidentiality_level || null,
        audit_trail || null,
        remarks || null
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contract execution:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}