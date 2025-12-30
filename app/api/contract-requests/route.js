import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/contract-requests:
 *   get:
 *     summary: Get all contract requests
 *     description: Retrieve list of all contract requests with pagination and filtering
 *     tags:
 *       - Contract Requests
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
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of contract requests
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
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM contract_requests';
    let params = [];
    let countParams = [];

    if (status) {
      queryText += ' WHERE status = $1';
      params.push(status);
      countParams.push(status);
    }

    queryText += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await query(queryText, params);

    const countQuery = status
      ? 'SELECT COUNT(*) FROM contract_requests WHERE status = $1'
      : 'SELECT COUNT(*) FROM contract_requests';
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
    console.error('Error fetching contract requests:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-requests:
 *   post:
 *     summary: Create a new contract request
 *     description: Submit a new contract request
 *     tags:
 *       - Contract Requests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - request_id
 *               - requester_name
 *               - contract_type
 *               - purpose_description
 *               - expected_start_date
 *               - expected_end_date
 *               - priority_level
 *               - department_name
 *             properties:
 *               request_id:
 *                 type: string
 *               requester_name:
 *                 type: string
 *               contract_type:
 *                 type: string
 *               purpose_description:
 *                 type: string
 *               expected_start_date:
 *                 type: string
 *                 format: date-time
 *               expected_end_date:
 *                 type: string
 *                 format: date-time
 *               priority_level:
 *                 type: string
 *               budget_estimate:
 *                 type: string
 *               department_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contract request created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      request_id,
      requester_name,
      contract_type,
      purpose_description,
      expected_start_date,
      expected_end_date,
      priority_level,
      budget_estimate,
      department_name
    } = body;

    if (!request_id || !requester_name || !contract_type || !purpose_description || 
        !expected_start_date || !expected_end_date || !priority_level || !department_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO contract_requests 
       (request_id, requester_name, contract_type, purpose_description, expected_start_date, 
        expected_end_date, priority_level, budget_estimate, department_name, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [request_id, requester_name, contract_type, purpose_description, expected_start_date,
       expected_end_date, priority_level, budget_estimate, department_name, 'Pending']
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contract request:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}