export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  return password && password.length >= 8;
}

export function validateDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
}

export function validateContractNumber(contractNumber) {
  return contractNumber && contractNumber.trim().length > 0;
}

export function validateRole(role) {
  const validRoles = ['admin', 'contract_manager', 'legal_reviewer', 'viewer'];
  return validRoles.includes(role);
}

export function validateStatus(status, type = 'contract') {
  const contractStatuses = ['Draft', 'Under Review', 'Approved', 'Active', 'Expired', 'Terminated'];
  const complianceStatuses = ['Compliant', 'Non-Compliant', 'Pending Review', 'At Risk'];
  const draftStatuses = ['Draft', 'Under Review', 'Approved', 'Rejected'];

  switch (type) {
    case 'contract':
      return contractStatuses.includes(status);
    case 'compliance':
      return complianceStatuses.includes(status);
    case 'draft':
      return draftStatuses.includes(status);
    default:
      return false;
  }
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
}