export enum UserRole {
  ADMIN = 'admin'
}

export const ORG_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  STAFF: 'staff'
} as const;

export type OrgRole = (typeof ORG_ROLES)[keyof typeof ORG_ROLES];

export const InvitationStatus = {
  PENDING: 'pending',
  CANCELED: 'canceled',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
} as const;

export type InvitationStatusValue = (typeof InvitationStatus)[keyof typeof InvitationStatus];
