import { query } from './db';

export async function createAuditLog({
  contract_id,
  user_id,
  action,
  description,
  ip_address
}) {
  try {
    await query(
      `INSERT INTO audit_logs (
        contract_id, user_id, action, description, timestamp, ip_address
      ) VALUES ($1, $2, $3, $4, NOW(), $5)`,
      [contract_id, user_id, action, description, ip_address]
    );
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

export async function getAuditLogs(contractId = null, limit = 100) {
  try {
    let sql = `
      SELECT al.*, u.name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
    `;
    const params = [];

    if (contractId) {
      sql += ' WHERE al.contract_id = $1';
      params.push(contractId);
    }

    sql += ' ORDER BY al.timestamp DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Get audit logs error:', error);
    return [];
  }
}

export function getActionDescription(action, entity, details = {}) {
  const descriptions = {
    Create: `Created ${entity} ${details.identifier || ''}`,
    Update: `Updated ${entity} ${details.identifier || ''}`,
    Delete: `Deleted ${entity} ${details.identifier || ''}`,
    View: `Viewed ${entity} ${details.identifier || ''}`,
    Approve: `Approved ${entity} ${details.identifier || ''}`,
    Reject: `Rejected ${entity} ${details.identifier || ''}`
  };

  return descriptions[action] || `${action} ${entity}`;
}