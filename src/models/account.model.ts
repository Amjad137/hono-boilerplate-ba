import { IBaseEntity } from '@/constants/common.constants';
import { COLLECTIONS } from '@/constants/db.constants';
import { Model, model, Schema, Types } from 'mongoose';

export interface IAccount extends IBaseEntity {
  accountId: string;
  providerId: string;
  userId: Types.ObjectId;

  accessToken?: string;
  refreshToken?: string;
  idToken?: string;

  expiresAt?: Date;
  password?: string;

  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;

  scope?: string;
}

export interface AccountModel extends Model<IAccount> {}

const AccountSchema = new Schema<IAccount, AccountModel>(
  {
    accountId: { type: String, required: true },
    providerId: { type: String, required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USER,
      required: true
    },
    accessToken: { type: String },
    refreshToken: { type: String },
    idToken: { type: String },
    expiresAt: { type: Date },
    password: { type: String },

    accessTokenExpiresAt: { type: Date },
    refreshTokenExpiresAt: { type: Date },
    scope: { type: String }
  },
  {
    timestamps: true
  }
);

AccountSchema.index({ userId: 1 });
AccountSchema.index({ providerId: 1, accountId: 1 }, { unique: true });

export const Account = model<IAccount, AccountModel>(COLLECTIONS.ACCOUNT, AccountSchema);
