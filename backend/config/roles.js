// User roles enum for consistent role management across the application
const UserRoles = {
  ADMIN: 'Admin',
  EDITOR: 'Éditeur',
  WRITER: 'Rédacteur',
  READER: 'Lecteur'
};

// Array of all roles (useful for validation)
const ALL_ROLES = Object.values(UserRoles);

// Role hierarchy (higher number = more permissions)
const RoleHierarchy = {
  [UserRoles.ADMIN]: 4,
  [UserRoles.EDITOR]: 3,
  [UserRoles.WRITER]: 2,
  [UserRoles.READER]: 1
};

// Helper function to check if a role has at least the permission level of another role
const hasMinimumRole = (userRole, minimumRole) => {
  return RoleHierarchy[userRole] >= RoleHierarchy[minimumRole];
};

module.exports = {
  UserRoles,
  ALL_ROLES,
  RoleHierarchy,
  hasMinimumRole
};
