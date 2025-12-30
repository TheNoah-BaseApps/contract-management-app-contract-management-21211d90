import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/contract-amendments/{id}:
 *   get:
 *     summary: Get a contract amendment record by ID
 *     description: Retrieve a specific contract amendment record
 *     tags: [Contract Amendment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract amendment record ID
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Contract amendment record not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM contract_amendments WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract amendment record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching contract amendment record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-amendments/{id}:
 *   put:
 *     summary: Update a contract amendment record
 *     description: Update an existing contract amendment record
 *     tags: [Contract Amendment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract amendment record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Contract amendment record updated successfully
 *       404:
 *         description: Contract amendment record not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

    const result = await query(
      `UPDATE contract_amendments SET
        amendment_id = COALESCE($1, amendment_id),
        contract_id = COALESCE($2, contract_id),
        amendment_date = COALESCE($3, amendment_date),
        amended_by = COALESCE($4, amended_by),
        amendment_reason = COALESCE($5, amendment_reason),
        clauses_amended = COALESCE($6, clauses_amended),
        amendment_status = COALESCE($7, amendment_status),
        legal_review_required = COALESCE($8, legal_review_required),
        amendment_document_ref = COALESCE($9, amendment_document_ref),
        updated_at = NOW()
      WHERE id = $10 RETURNING *`,
      [
        amendment_id,
        contract_id,
        amendment_date,
        amended_by,
        amendment_reason,
        clauses_amended,
        amendment_status,
        legal_review_required,
        amendment_document_ref,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract amendment record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating contract amendment record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-amendments/{id}:
 *   delete:
 *     summary: Delete a contract amendment record
 *     description: Delete a specific contract amendment record
 *     tags: [Contract Amendment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract amendment record ID
 *     responses:
 *       200:
 *         description: Contract amendment record deleted successfully
 *       404:
 *         description: Contract amendment record not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM contract_amendments WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract amendment record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contract amendment record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contract amendment record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}