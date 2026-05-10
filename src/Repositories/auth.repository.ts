import { getMongoDb } from '@/config/db.config';
import type {
  Collection,
  DeleteResult,
  Document,
  Filter,
  FindOptions,
  InsertManyResult,
  UpdateFilter,
  UpdateResult,
  WithId
} from 'mongodb';

export type SortOrder = 'asc' | 'desc';

export interface FindAllOptions {
  sort_by?: string;
  sort_order?: SortOrder;
  limit?: number;
  skip?: number;
}

export interface FindAllResult<T> {
  results: WithId<T>[];
  extras: {
    total: number;
    limit?: number;
    skip?: number;
  };
}

export interface LookupOptions {
  from: string;
  localField: string;
  foreignField: string;
  as: string;
}

/**
 * Base repository for better-auth managed collections.
 * Bypasses Mongoose — operates directly on the native MongoDB driver
 * since better-auth owns the lifecycle of these collections.
 */
export class AuthRepository<T extends { id: string } & Record<string, unknown>> {
  private readonly collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected getCollection = (): Collection<T> => getMongoDb().collection<T>(this.collectionName);

  /*----------- Write --------------*/
  public create = async (data: T): Promise<WithId<T>> => {
    const result = await this.getCollection().insertOne(
      data as unknown as Parameters<Collection<T>['insertOne']>[0]
    );
    return { ...data, _id: result.insertedId } as unknown as WithId<T>;
  };

  public createMany = async (data: T[]): Promise<InsertManyResult<T>> =>
    this.getCollection().insertMany(data as unknown as Parameters<Collection<T>['insertMany']>[0], {
      ordered: true
    });

  /*----------- Read --------------*/
  public findAll = async (
    filter: Filter<T>,
    options?: FindAllOptions
  ): Promise<FindAllResult<T>> => {
    const pipeline: Document[] = [];

    if (filter && Object.keys(filter).length > 0) {
      pipeline.push({ $match: filter });
    }

    const aggregated = await this.getCollection()
      .aggregate<{
        results: WithId<T>[];
        extras: { total: number } | null;
      }>([
        ...pipeline,
        {
          $facet: {
            results: [
              {
                $sort: {
                  [options?.sort_by ?? 'createdAt']: options?.sort_order === 'asc' ? 1 : -1
                }
              },
              ...(options?.skip !== undefined ? [{ $skip: options.skip }] : []),
              ...(options?.limit ? [{ $limit: options.limit }] : [])
            ],
            extras: [{ $count: 'total' }]
          }
        },
        {
          $unwind: {
            path: '$extras',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            extras: {
              $ifNull: ['$extras', { total: 0 }]
            }
          }
        }
      ])
      .toArray();

    const raw = aggregated[0];

    return {
      results: raw?.results ?? [],
      extras: {
        total: raw?.extras?.total ?? 0,
        limit: options?.limit,
        skip: options?.skip
      }
    };
  };

  public findAllWithLookup = async (
    filter: Filter<T>,
    lookup: LookupOptions,
    options?: FindAllOptions
  ): Promise<FindAllResult<T>> => {
    const pipeline: Document[] = [];

    if (filter && Object.keys(filter).length > 0) {
      pipeline.push({ $match: filter });
    }

    pipeline.push({ $lookup: lookup });

    const aggregated = await this.getCollection()
      .aggregate<{
        results: WithId<T>[];
        extras: { total: number } | null;
      }>([
        ...pipeline,
        {
          $facet: {
            results: [
              {
                $sort: {
                  [options?.sort_by ?? 'createdAt']: options?.sort_order === 'asc' ? 1 : -1
                }
              },
              ...(options?.skip !== undefined ? [{ $skip: options.skip }] : []),
              ...(options?.limit ? [{ $limit: options.limit }] : [])
            ],
            extras: [{ $count: 'total' }]
          }
        },
        {
          $unwind: {
            path: '$extras',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            extras: {
              $ifNull: ['$extras', { total: 0 }]
            }
          }
        }
      ])
      .toArray();

    const raw = aggregated[0];

    return {
      results: raw?.results ?? [],
      extras: {
        total: raw?.extras?.total ?? 0,
        limit: options?.limit,
        skip: options?.skip
      }
    };
  };

  public findOne = async (filter: Filter<T>, options?: FindOptions<T>): Promise<WithId<T> | null> =>
    this.getCollection().findOne(filter, options);

  public findMany = async (filter: Filter<T>, options?: FindOptions<T>): Promise<WithId<T>[]> =>
    this.getCollection().find(filter, options).toArray();

  public findById = async (id: string): Promise<WithId<T> | null> =>
    this.findOne({ id } as Filter<T>);

  /*----------- Update --------------*/
  public findOneAndUpdate = async (
    filter: Filter<T>,
    update: UpdateFilter<T>
  ): Promise<WithId<T> | null> =>
    this.getCollection().findOneAndUpdate(filter, update, { returnDocument: 'after' });

  public updateOne = async (filter: Filter<T>, update: UpdateFilter<T>): Promise<UpdateResult> =>
    this.getCollection().updateOne(filter, update);

  public updateMany = async (filter: Filter<T>, update: UpdateFilter<T>): Promise<UpdateResult> =>
    this.getCollection().updateMany(filter, update);

  public updateById = async (id: string, update: UpdateFilter<T>): Promise<WithId<T> | null> =>
    this.getCollection().findOneAndUpdate({ id } as Filter<T>, update, { returnDocument: 'after' });

  /*----------- Delete --------------*/
  public findOneAndDelete = async (filter: Filter<T>): Promise<WithId<T> | null> =>
    this.getCollection().findOneAndDelete(filter);

  public deleteOne = async (filter: Filter<T>): Promise<DeleteResult> =>
    this.getCollection().deleteOne(filter);

  public deleteMany = async (filter: Filter<T>): Promise<DeleteResult> =>
    this.getCollection().deleteMany(filter);

  /*----------- Aggregate --------------*/
  public countDocuments = async (filter: Filter<T> = {}): Promise<number> =>
    this.getCollection().countDocuments(filter);
}
