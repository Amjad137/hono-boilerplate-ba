import { Types } from 'mongoose';

export interface IBaseEntity {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type OmitBaseEntity<T extends IBaseEntity> = Omit<T, '_id' | 'createdAt' | 'updatedAt'>;
