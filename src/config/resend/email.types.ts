export interface SendEmailParams {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  replyTo?: string;
}

export type SendEmailHandler = (params: SendEmailParams) => Promise<void>;
