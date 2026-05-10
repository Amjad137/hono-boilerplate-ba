import { ORG_ROLES } from '@/constants/auth.constants';
import { SYSTEM_ROLE } from '@/constants/user.constants';
import { userRepository } from '@/Repositories/user.repository';
import { sendEmail } from '@/services/email.service';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { APIError } from 'better-auth/api';
import { admin, organization, username } from 'better-auth/plugins';
import { getMongoClient, getMongoDb } from '../db.config';
import environment from '../env.config';
import { OrgInvitationEmail } from '../resend/templates/org-invitation.template';
import { ac, manager, owner, staff } from './permissions';

export const auth = betterAuth({
  baseURL: environment.apiUrl,
  basePath: 'v1/auth',
  secret: environment.betterAuthSecret,

  trustedOrigins: [environment.clientUrl],

  database: mongodbAdapter(getMongoDb(), {
    client: getMongoClient()
  }),

  experimental: { joins: true },

  user: {
    additionalFields: {
      phoneNumber: {
        type: 'string',
        required: true
      },
      role: {
        type: 'string',
        required: true,
        defaultValue: SYSTEM_ROLE.USER
      }
    }
  },

  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5
    }
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8
  },

  plugins: [
    admin(),

    username({
      minUsernameLength: 5,
      maxUsernameLength: 25
    }),

    organization({
      ac,
      roles: {
        [ORG_ROLES.OWNER]: owner,
        [ORG_ROLES.MANAGER]: manager,
        [ORG_ROLES.STAFF]: staff
      },
      creatorRole: ORG_ROLES.OWNER,
      allowUserToCreateOrganization: async (user) => user.userRole === ORG_ROLES.OWNER,
      membershipLimit: 50,
      schema: {
        organization: {
          additionalFields: {
            address: {
              type: 'string',
              required: true
            }
          }
        },
        member: {
          additionalFields: {}
        }
      },

      organizationHooks: {
        beforeCreateInvitation: async ({ invitation, organization }) => {
          if (invitation.role === ORG_ROLES.OWNER) {
            const existingMembers = organization.members ?? [];
            const hasOwner = existingMembers.some(
              (m: { role: string }) => m.role === ORG_ROLES.OWNER
            );
            if (hasOwner) {
              throw new Error('Each organization can only have one owner.');
            }
          }
        }
      },

      sendInvitationEmail: async ({ email, id, organization, inviter }) => {
        const existingUser = await userRepository.findByEmail(email.toLowerCase());

        const url = new URL(existingUser ? '/login' : '/signup', environment.clientUrl);
        url.searchParams.set('invitationId', id);
        url.searchParams.set('email', email);

        await sendEmail({
          to: email,
          subject: `You've been invited to join ${organization.name} on ABC Company`,
          react: OrgInvitationEmail({
            orgName: organization.name,
            invitationUrl: url.toString(),
            inviterName: inviter.user.name
          })
        });
      }
    })
  ],

  onAPIError: {
    onError(error, ctx) {
      if (error instanceof APIError) return;
      console.error('[BetterAuth Error]', error, { ctx });
    }
  }
});

export type Session = typeof auth.$Infer.Session;
export type ActiveOrganization = NonNullable<
  Awaited<ReturnType<typeof auth.api.getFullOrganization>>
>;
export type Organization = typeof auth.$Infer.Organization;
export type OrganizationMember = ActiveOrganization['members'][number];
export type OrganizationMemberRole = OrganizationMember['role'];
export type OrganizationInvitationStatus = (typeof auth.$Infer.Invitation)['status'];
