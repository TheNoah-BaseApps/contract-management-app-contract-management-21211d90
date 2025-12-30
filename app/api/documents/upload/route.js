/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Upload contract document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const contract_id = formData.get('contract_id');
    const document_type = formData.get('document_type');
    const file = formData.get('file');

    if (!contract_id || !document_type || !file) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO contract_documents (
        contract_id, document_name, document_type, file_path,
        file_size, uploaded_by, uploaded_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *`,
      [
        contract_id,
        file.name,
        document_type,
        `/uploads/${file.name}`,
        file.size,
        user.id
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Document uploaded successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload document error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}