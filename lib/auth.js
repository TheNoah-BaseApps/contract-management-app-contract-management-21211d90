import { verifyToken } from './jwt';

export async function verifyAuth(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);

    if (!payload) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export function checkPermission(user, requiredRole) {
  if (!user) return false;

  const roleHierarchy = {
    admin: 4,
    contract_manager: 3,
    legal_reviewer: 2,
    viewer: 1
  };

  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
}

export function isAdmin(user) {
  return user && user.role === 'admin';
}

export function canEditContract(user) {
  return user && ['admin', 'contract_manager'].includes(user.role);
}

export function canReviewDraft(user) {
  return user && ['admin', 'legal_reviewer'].includes(user.role);
}