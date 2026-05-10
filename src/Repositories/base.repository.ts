import { IBaseEntity, OmitBaseEntity } from '@/constants/common.constants';
import {
  Document,
  FilterQuery,
  Model,
  PipelineStage,
  PopulateOptions,
  QueryOptions,
  UpdateQuery
} from 'mongoose';
import { ENTITY_SORT, ENTITY_STATUS } from '../constants/db.constants';
import { BaseExtrasDTO } from '../dto/common.dto';

export class BaseRepository<T extends IBaseEntity, U extends Model<T>> {
  protected model: U;

  constructor(model: U) {
    this.model = model;
  }

  private getSchemaHiddenFields(): Record<string, 0> {
    const hiddenFields: Record<string, 0> = {};

    Object.entries(this.model.schema.paths).forEach(([path, schemaType]) => {
      if (schemaType.options?.select === false) {
        hiddenFields[path] = 0;
      }
    });

    return hiddenFields;
  }

  public create = async (data: OmitBaseEntity<T>) => this.model.create(data);

  public createMany = async (data: OmitBaseEntity<T>[]) =>
    this.model.insertMany(data, { ordered: true });

  public findAll = async (
    filters: FilterQuery<Partial<T>>,
    options?: {
      sort_by?: string;
      sort_order?: ENTITY_SORT;
      limit?: number;
      skip?: number;
      hide_deleted?: boolean;
      search_key?: string;
    }
  ): Promise<{
    results: (Document<unknown, unknown, T> & T & Required<{ _id: string }>)[];
    extras: BaseExtrasDTO;
  }> => {
    const searchPipelines: PipelineStage[] = [];
    const paginationPipelines: PipelineStage.FacetPipelineStage[] =
      (options?.limit ?? 0) > 0 && (options?.skip ?? 0) >= 0
        ? [{ $skip: options?.skip ?? 0 }, { $limit: options?.limit ?? 0 }]
        : [];

    if (options?.hide_deleted) {
      searchPipelines.push({
        $match: {
          status: { $ne: ENTITY_STATUS.DELETED }
        }
      });
    }

    if (filters) {
      searchPipelines.push({
        $match: {
          ...filters
        }
      });
    }

    if (options?.search_key) {
      searchPipelines.push({
        $match: {
          $or: [{ name: { $regex: options.search_key, $options: 'i' } }]
        }
      });
    }

    const hiddenFields = this.getSchemaHiddenFields();
    if (Object.keys(hiddenFields).length > 0) {
      searchPipelines.push({
        $project: hiddenFields
      });
    }

    const aggregatedDocs = await this.model.aggregate([
      ...searchPipelines,
      {
        $facet: {
          results: [
            {
              $sort: {
                [options?.sort_by ?? 'createdAt']: options?.sort_order === 'asc' ? 1 : -1
              }
            },
            ...paginationPipelines
          ],
          extras: [
            {
              $count: 'total'
            }
          ]
        }
      },
      {
        $unwind: {
          path: '$extras',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          results: 1,
          extras: {
            $ifNull: ['$extras', { total: 0 }]
          }
        }
      },
      {
        $addFields: {
          extras: {
            total: '$extras.total',
            limit: options?.limit,
            skip: options?.skip
          }
        }
      }
    ]);

    return Promise.resolve(aggregatedDocs[0]);
  };

  public findAllAndPopulate = async (
    filters: FilterQuery<Partial<T>>,
    options?: {
      sort_by?: string;
      sort_order?: ENTITY_SORT;
      limit?: number;
      skip?: number;
      hide_deleted?: boolean;
      search_key?: string;
    },
    populateOptions: PopulateOptions | (string | PopulateOptions)[] = []
  ): Promise<{
    results: (Document<unknown, unknown, T> & T & Required<{ _id: string }>)[];
    extras: BaseExtrasDTO;
  }> => {
    // Build the base filter
    let baseFilter: FilterQuery<T> = { ...filters };

    if (options?.hide_deleted) {
      baseFilter = {
        ...baseFilter,
        status: { $ne: ENTITY_STATUS.DELETED }
      };
    }

    if (options?.search_key) {
      baseFilter = {
        ...baseFilter,
        $or: [{ name: { $regex: options.search_key, $options: 'i' } }]
      };
    }

    // Get total count for pagination
    const total = await this.model.countDocuments(baseFilter);

    // Build query with population
    let query = this.model.find(baseFilter);

    // Apply population
    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    // Apply sorting
    const sortField = options?.sort_by ?? 'createdAt';
    const sortOrder = options?.sort_order === 'asc' ? 1 : -1;
    query = query.sort({ [sortField]: sortOrder });

    // Apply pagination
    if (options?.skip !== undefined && options.skip >= 0) {
      query = query.skip(options.skip);
    }
    if (options?.limit !== undefined && options.limit > 0) {
      query = query.limit(options.limit);
    }

    // Execute query
    const results = await query.exec();

    return {
      results: results as (Document<unknown, unknown, T> & T & Required<{ _id: string }>)[],
      extras: {
        total,
        limit: options?.limit,
        skip: options?.skip
      }
    };
  };

  public findOne = async (filters: FilterQuery<Partial<T>>) => {
    const result = await this.model.findOne(filters);
    return result ?? undefined;
  };

  public findOneAndPopulate = async <V>(
    filters: FilterQuery<T>,
    populateOptions: PopulateOptions | (string | PopulateOptions)[]
  ) => {
    const result = await this.model.findOne(filters).populate<V>(populateOptions);
    return result ?? undefined;
  };

  public findOneAndUpdate = async (
    filters: FilterQuery<Partial<T>>,
    data: UpdateQuery<T>,
    options: QueryOptions<T> = {}
  ) => {
    const result = await this.model.findOneAndUpdate(filters, data, {
      new: true,
      ...options
    });
    return result;
  };

  public findById = async (id: string) => this.model.findById(id) ?? undefined;

  public updateById = async (id: string, data: UpdateQuery<T>, options: QueryOptions<T> = {}) =>
    this.model.findByIdAndUpdate(id, data, {
      new: true,
      ...options
    });

  public updateOne = async (
    filters: FilterQuery<Partial<T>>,
    data: UpdateQuery<T>,
    options?: QueryOptions<T>
  ) => {
    // Remove session if it's null to satisfy Mongoose's type
    const cleanOptions =
      options && options.session === null
        ? ({ ...options, session: undefined } as Parameters<typeof this.model.updateOne>[2])
        : (options as Parameters<typeof this.model.updateOne>[2]);
    return this.model.updateOne(filters, data, cleanOptions);
  };

  public updateMany = async (filters: FilterQuery<Partial<T>>, data: UpdateQuery<T>) =>
    this.model.updateMany(filters, data);

  public deleteOne = async (filters: FilterQuery<Partial<T>>) => this.model.deleteOne(filters);

  public deleteById = async (id: string) =>
    this.model.findByIdAndDelete(id, { returnDocument: 'after' });

  public deleteMany = async (filters: FilterQuery<Partial<T>>) => this.model.deleteMany(filters);

  public countDocuments = async (filters: FilterQuery<Partial<T>> = {}) => {
    return this.model.countDocuments(filters);
  };
}
