export const MODULE_PERMISSIONS = {
  dashboard: 'dashboard:view',
  students: 'students:manage',
  categories: 'categories:manage',
  stage: 'stage:manage',
  budget: 'budget:manage',
  responsibilities: 'task:manage',
  notifications: 'notifications:view',
  admin: 'users:manage',
  whatsapp: 'whatsapp:send'
};

export const APP_ROUTES = [
  { label: 'Dashboard', to: '/', permission: MODULE_PERMISSIONS.dashboard },
  { label: 'Students', to: '/students', permission: MODULE_PERMISSIONS.students },
  { label: 'Categories', to: '/categories', permission: MODULE_PERMISSIONS.categories },
  { label: 'Live Stage', to: '/stage', permission: MODULE_PERMISSIONS.stage },
  { label: 'Budget', to: '/budget', permission: MODULE_PERMISSIONS.budget },
  { label: 'Tasks', to: '/responsibilities', permission: MODULE_PERMISSIONS.responsibilities },
  { label: 'Notifications', to: '/notifications', permission: MODULE_PERMISSIONS.notifications },
  { label: 'WhatsApp', to: '/whatsapp', permission: MODULE_PERMISSIONS.whatsapp },
  { label: 'Admin', to: '/admin', permission: MODULE_PERMISSIONS.admin }
];

export function getPermissions(user) {
  return user?.roleId?.permissions || [];
}

export function canAccess(user, permission) {
  if (!permission) return true;
  const permissions = getPermissions(user);
  if (!permissions.length) return true;
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
}
