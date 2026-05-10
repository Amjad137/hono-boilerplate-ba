// src/validators/yup.validator.ts
import { Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';

// Extend the Hono context type
declare module 'hono' {
  interface HonoRequest {
    getValid: (type: 'json' | 'query' | 'param' | 'header') => any;
  }
  interface ContextVariableMap {
    validatedData: {
      json?: any;
      query?: any;
      param?: any;
      header?: any;
    };
  }
}

type ValidationType = 'json' | 'query' | 'param' | 'header';

export const yupValidator = (type: ValidationType, schema: yup.AnySchema) => {
  return createMiddleware(async (c: Context, next) => {
    try {
      let data: any;

      // Get data based on validation type
      switch (type) {
        case 'json':
          data = await c.req.json();
          break;
        case 'query':
          data = c.req.query();
          break;
        case 'param':
          data = c.req.param();
          break;
        case 'header':
          data = Object.fromEntries(c.req.raw.headers);
          break;
        default:
          throw new Error(`Unsupported validation type: ${type}`);
      }

      const validatedData = await schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
      });
      console.log('🚀 ~ returncreateMiddleware ~ validatedData:', validatedData);

      // Clean empty objects from validated data
      const cleanedData = cleanEmptyValues(validatedData);
      console.log('🚀 ~ returncreateMiddleware ~ cleanedData:', cleanedData);

      // Initialize validatedData if it doesn't exist
      if (!c.get('validatedData')) {
        c.set('validatedData', {});
      }

      // Store the validated data in the context
      const currentValidatedData = c.get('validatedData');
      currentValidatedData[type] = cleanedData;
      c.set('validatedCleanedData', currentValidatedData);

      // Add a method to get validated data
      c.req.getValid = (validationType: ValidationType) => {
        const validatedData = c.get('validatedData');
        if (!validatedData || !validatedData[validationType]) {
          throw new Error(`No validated data found for type: ${validationType}`);
        }
        return validatedData[validationType];
      };

      await next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        c.status(StatusCodes.BAD_REQUEST);
        return c.json({
          error: true,
          message: 'Validation failed',
          details: error.inner.map((err) => ({
            path: err.path,
            message: err.message
          }))
        });
      }
      throw error;
    }
  });
};

const cleanEmptyValues = <T extends Record<string, any>>(obj: T): Partial<T> => {
  // Handle null/undefined
  if (obj === null || obj === undefined) return obj;

  // Handle non-objects and arrays at the top level, allowing for primitives
  if (typeof obj !== 'object') return obj;

  // Special handling if the obj is an array, not an object
  if (Array.isArray(obj)) {
    // First apply recursion to any objects present in the array
    const mappedArray = obj.map((item) =>
      typeof item === 'object' && item !== null ? cleanEmptyValues(item) : item
    );

    // Then filter out empty strings, null, undefined
    return mappedArray.filter((item) => item !== '' && item !== null && item !== undefined) as any;
  }

  // Clone the object to avoid mutations
  const cleaned: Record<string, any> = { ...obj };

  // Process all properties
  Object.keys(cleaned).forEach((key) => {
    // Handle arrays
    if (Array.isArray(cleaned[key])) {
      // Clean each item in the array

      // Apply recursion to any objects present in the array
      cleaned[key] = cleaned[key].map((item: any) =>
        typeof item === 'object' && item !== null ? cleanEmptyValues(item) : item
      );

      // Filter out empty strings, null, undefined from the array
      cleaned[key] = cleaned[key].filter(
        (item: any) => item !== '' && item !== null && item !== undefined
      );

      // Remove empty arrays
      if (cleaned[key].length === 0) {
        delete cleaned[key];
      }
    }
    // Handle objects (but not arrays, already handled above) (and not dates)
    else if (cleaned[key] && typeof cleaned[key] === 'object' && !(cleaned[key] instanceof Date)) {
      cleaned[key] = cleanEmptyValues(cleaned[key]);

      // If object became empty after cleaning or was already empty, remove it
      if (Object.keys(cleaned[key]).length === 0) {
        delete cleaned[key];
      }
    }
    // Handle primitive empty values
    else if (cleaned[key] === '' || cleaned[key] === null || cleaned[key] === undefined) {
      // Remove empty strings, null, and undefined values
      delete cleaned[key];
    }
  });

  return cleaned as Partial<T>;
};
