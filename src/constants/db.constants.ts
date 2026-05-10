export enum COLLECTIONS {
  USER = 'User',
  ACCOUNT = 'Account',
  SESSION = 'Session',
  PASSWORD_RESET_REQUESTS = 'password_reset_requests',
  AUDIT_LOGS = 'audit_logs'
}

export enum ENTITY_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  HIDDEN = 'HIDDEN',
  DELETED = 'DELETED'
}

export enum ENTITY_SORT {
  ASC = 'asc',
  DESC = 'desc'
}

export enum USER_ENTITY_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
  DELETED = 'DELETED'
}
