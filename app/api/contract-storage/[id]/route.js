import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/contract-storage/{id}:
 *   get:
 *     summary: Get a contract storage record by ID
 *     description: Retrieve a specific contract storage record
 *     tags: [Contract Storage]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract storage record ID
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Contract storage record not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM contract_storage WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract storage record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching contract storage record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-storage/{id}:
 *   put:
 *     summary: Update a contract storage record
 *     description: Update an existing contract storage record
 *     tags: [Contract Storage]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract storage record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Contract storage record updated successfully
 *       404:
 *         description: Contract storage record not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

    const result = await query(
      `UPDATE contract_storage SET
        storage_id = COALESCE($1, storage_id),
        contract_id = COALESCE($2, contract_id),
        storage_location = COALESCE($3, storage_location),
        storage_date = COALESCE($4, storage_date),
        stored_by = COALESCE($5, stored_by),
        access_permissions = COALESCE($6, access_permissions),
        document_format = COALESCE($7, document_format),
        backup_location = COALESCE($8, backup_location),
        archival_policy = COALESCE($9, archival_policy),
        updated_at = NOW()
      WHERE id = $10 RETURNING *`,
      [
        storage_id,
        contract_id,
        storage_location,
        storage_date,
        stored_by,
        access_permissions,
        document_format,
        backup_location,
        archival_policy,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract storage record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating contract storage record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-storage/{id}:
 *   delete:
 *     summary: Delete a contract storage record
 *     description: Delete a specific contract storage record
 *     tags: [Contract Storage]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract storage record ID
 *     responses:
 *       200:
 *         description: Contract storage record deleted successfully
 *       404:
 *         description: Contract storage record not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM contract_storage WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract storage record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contract storage record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contract storage record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}