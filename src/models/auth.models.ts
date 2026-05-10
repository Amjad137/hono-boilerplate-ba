import { auth } from '@/config/better-auth';
import type { Organization, Member, Invitation } from 'better-auth/plugins';

// Core session types
export type ISession = (typeof auth)['$Infer']['Session']['session'];
export type IUser = (typeof auth)['$Infer']['Session']['user'];
export type IOrganization = Organization;
export type IMember = Member;
export type IInvitation = Invitation;
