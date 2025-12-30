import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/contract-terminations/{id}:
 *   get:
 *     summary: Get a contract termination record by ID
 *     description: Retrieve a specific contract termination record
 *     tags: [Contract Termination]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract termination record ID
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Contract termination record not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM contract_terminations WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract termination record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching contract termination record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-terminations/{id}:
 *   put:
 *     summary: Update a contract termination record
 *     description: Update an existing contract termination record
 *     tags: [Contract Termination]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract termination record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Contract termination record updated successfully
 *       404:
 *         description: Contract termination record not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const {
      termination_id,
      contract_id,
      termination_date,
      termination_reason,
      terminated_by,
      termination_status,
      counterparty_notified,
      exit_clause_reference,
      settlement_details
    } = body;

    const result = await query(
      `UPDATE contract_terminations SET
        termination_id = COALESCE($1, termination_id),
        contract_id = COALESCE($2, contract_id),
        termination_date = COALESCE($3, termination_date),
        termination_reason = COALESCE($4, termination_reason),
        terminated_by = COALESCE($5, terminated_by),
        termination_status = COALESCE($6, termination_status),
        counterparty_notified = COALESCE($7, counterparty_notified),
        exit_clause_reference = COALESCE($8, exit_clause_reference),
        settlement_details = COALESCE($9, settlement_details),
        updated_at = NOW()
      WHERE id = $10 RETURNING *`,
      [
        termination_id,
        contract_id,
        termination_date,
        termination_reason,
        terminated_by,
        termination_status,
        counterparty_notified,
        exit_clause_reference,
        settlement_details,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract termination record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating contract termination record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-terminations/{id}:
 *   delete:
 *     summary: Delete a contract termination record
 *     description: Delete a specific contract termination record
 *     tags: [Contract Termination]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract termination record ID
 *     responses:
 *       200:
 *         description: Contract termination record deleted successfully
 *       404:
 *         description: Contract termination record not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM contract_terminations WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract termination record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contract termination record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contract termination record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}