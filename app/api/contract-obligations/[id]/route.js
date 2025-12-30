import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/contract-obligations/{id}:
 *   get:
 *     summary: Get contract obligation by ID
 *     tags: [Contract Obligations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contract obligation details
 *       404:
 *         description: Contract obligation not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM contract_obligations WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract obligation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching contract obligation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-obligations/{id}:
 *   put:
 *     summary: Update contract obligation
 *     tags: [Contract Obligations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Contract obligation updated successfully
 *       404:
 *         description: Contract obligation not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const {
      obligation_id,
      contract_id,
      obligation_title,
      obligation_details,
      responsible_party,
      due_date,
      fulfillment_status,
      fulfillment_date,
      remarks
    } = body;

    const sql = `
      UPDATE contract_obligations
      SET obligation_id = COALESCE($1, obligation_id),
          contract_id = COALESCE($2, contract_id),
          obligation_title = COALESCE($3, obligation_title),
          obligation_details = COALESCE($4, obligation_details),
          responsible_party = COALESCE($5, responsible_party),
          due_date = COALESCE($6, due_date),
          fulfillment_status = COALESCE($7, fulfillment_status),
          fulfillment_date = COALESCE($8, fulfillment_date),
          remarks = COALESCE($9, remarks),
          updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `;

    const result = await query(sql, [
      obligation_id,
      contract_id,
      obligation_title,
      obligation_details,
      responsible_party,
      due_date,
      fulfillment_status,
      fulfillment_date,
      remarks,
      id
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract obligation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating contract obligation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-obligations/{id}:
 *   delete:
 *     summary: Delete contract obligation
 *     tags: [Contract Obligations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contract obligation deleted successfully
 *       404:
 *         description: Contract obligation not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM contract_obligations WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract obligation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Contract obligation deleted successfully' });
  } catch (error) {
    console.error('Error deleting contract obligation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}