export const PERMISSION_MODULES = [
  'users',
  'roles',
  'units',
  'building_types',
  'unit_types',
  'features',
  'clients',
  'deals',
  'tasks',
  'activities',
  'communications',
  'documents',
  'analytics',
  'settings',
  'audit_logs',
  'media',
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const PERMISSION_ACTIONS = ['create', 'read', 'update', 'delete'] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];
