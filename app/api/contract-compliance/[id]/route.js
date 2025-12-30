import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/contract-compliance/{id}:
 *   get:
 *     summary: Get contract compliance record by ID
 *     tags: [Contract Compliance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contract compliance record details
 *       404:
 *         description: Contract compliance record not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM contract_compliance WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract compliance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching contract compliance record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-compliance/{id}:
 *   put:
 *     summary: Update contract compliance record
 *     tags: [Contract Compliance]
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
 *         description: Contract compliance record updated successfully
 *       404:
 *         description: Contract compliance record not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

    const sql = `
      UPDATE contract_compliance
      SET compliance_id = COALESCE($1, compliance_id),
          contract_id = COALESCE($2, contract_id),
          compliance_check_date = COALESCE($3, compliance_check_date),
          compliance_officer = COALESCE($4, compliance_officer),
          compliance_result = COALESCE($5, compliance_result),
          non_compliance_issues = COALESCE($6, non_compliance_issues),
          corrective_actions = COALESCE($7, corrective_actions),
          follow_up_date = COALESCE($8, follow_up_date),
          audit_trail_ref = COALESCE($9, audit_trail_ref),
          updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `;

    const result = await query(sql, [
      compliance_id,
      contract_id,
      compliance_check_date,
      compliance_officer,
      compliance_result,
      non_compliance_issues,
      corrective_actions,
      follow_up_date,
      audit_trail_ref,
      id
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract compliance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating contract compliance record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contract-compliance/{id}:
 *   delete:
 *     summary: Delete contract compliance record
 *     tags: [Contract Compliance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contract compliance record deleted successfully
 *       404:
 *         description: Contract compliance record not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM contract_compliance WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract compliance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Contract compliance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting contract compliance record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}