import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text
} from '@react-email/components';

import environment from '@/config/env.config.js';

interface OrgInvitationEmailProps {
  orgName: string;
  invitationUrl: string;
  inviterName?: string;
}

const LOGO_PATH = '/images/logo/company-logo.webp';

export function OrgInvitationEmail({
  orgName,
  invitationUrl,
  inviterName
}: OrgInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join {orgName} on ABC Company</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                primary: '#0d9488',
                background: '#f8fafc',
                border: '#e2e8f0',
                foreground: '#0f172a',
                muted: '#64748b'
              }
            }
          }
        }}
      >
        <Body className='bg-background m-0 py-10 px-4 font-sans text-foreground'>
          <Container className='bg-white/50 rounded-xl overflow-hidden shadow-sm border border-border max-w-[600px] mx-auto'>
            <Section className='bg-white/50 py-7 px-10 border-b border-border'>
              <Text className='m-0'>
                <Img
                  src={`${environment.clientUrl}${LOGO_PATH}`}
                  width='32'
                  height='32'
                  alt='ABC Company'
                  className='inline-block mr-2.5 align-middle rounded-lg'
                />
                <span className='text-foreground text-xl font-bold tracking-tight align-middle'>
                  ABC Company
                </span>
              </Text>
            </Section>

            <Section className='py-10 px-10 pb-8'>
              <Heading
                as='h2'
                className='text-[22px] font-bold text-foreground m-0 mb-4 tracking-tight'
              >
                You've been invited
              </Heading>
              <Text className='text-[15px] leading-6 text-muted m-0 mb-5'>
                {inviterName ? (
                  <>
                    <strong className='text-foreground'>{inviterName}</strong> has invited you to
                    join{' '}
                  </>
                ) : (
                  "You've been invited to join "
                )}
                <strong className='text-foreground'>{orgName}</strong> on the{' '}
                <strong className='text-foreground'>ABC Company Client Portal</strong>. Click the
                button below to accept the invitation.
              </Text>

              <Section className='py-2 pb-6 text-center'>
                <Button
                  href={invitationUrl}
                  className='bg-primary text-white text-[15px] font-semibold no-underline py-3.5 px-8 rounded-lg tracking-wide inline-block'
                >
                  Accept Invitation
                </Button>
              </Section>

              <Text className='text-[15px] leading-6 text-muted m-0 mb-5'>
                Or copy and paste this link into your browser:
              </Text>
              <Text className='text-[13px] leading-5 m-0 mb-5 break-all'>
                <Link href={invitationUrl} className='text-primary underline'>
                  {invitationUrl}
                </Link>
              </Text>

              <Section className='bg-slate-50 border-l-4 border-primary rounded-md py-3.5 px-4 m-0 mb-6'>
                <Text className='text-[13px] leading-5 text-muted m-0'>
                  This invitation link will expire after a period of time. If you did not expect
                  this invitation, you can safely ignore it.
                </Text>
              </Section>

              <Hr className='border-t border-border mx-10 w-[calc(100%-80px)]' />

              <Text className='text-xs leading-5 text-slate-400 m-0 mb-2'>
                © {new Date().getFullYear()} ABC Company. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
