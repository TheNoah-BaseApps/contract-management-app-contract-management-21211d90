import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/contract-storage:
 *   get:
 *     summary: Get all contract storage records
 *     description: Retrieve a list of all contract storage records with pagination
 *     tags: [Contract Storage]
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
      'SELECT * FROM contract_storage ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching contract storage records:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-storage:
 *   post:
 *     summary: Create a new contract storage record
 *     description: Create a new contract storage entry
 *     tags: [Contract Storage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storage_id
 *               - contract_id
 *               - storage_location
 *               - storage_date
 *               - stored_by
 *             properties:
 *               storage_id:
 *                 type: string
 *               contract_id:
 *                 type: string
 *               storage_location:
 *                 type: string
 *               storage_date:
 *                 type: string
 *                 format: date-time
 *               stored_by:
 *                 type: string
 *               access_permissions:
 *                 type: string
 *               document_format:
 *                 type: string
 *               backup_location:
 *                 type: string
 *               archival_policy:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contract storage record created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      storage_id,
      contract_id,
      storage_location,
      storage_date,
      stored_by,
      access_permissions,
      document_format,
      backup_location,
      archival_policy
    } = body;

    if (!storage_id || !contract_id || !storage_location || !storage_date || !stored_by) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO contract_storage (
        storage_id, contract_id, storage_location, storage_date, stored_by,
        access_permissions, document_format, backup_location, archival_policy,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING *`,
      [
        storage_id,
        contract_id,
        storage_location,
        storage_date,
        stored_by,
        access_permissions || null,
        document_format || null,
        backup_location || null,
        archival_policy || null
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contract storage record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}