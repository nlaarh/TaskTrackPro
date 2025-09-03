import { pool } from '../db';

// Common database query wrapper with error handling
export const executeQuery = async (query: string, params: any[] = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Execute transaction with automatic rollback on error
export const executeTransaction = async (queries: Array<{query: string, params: any[]}>) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results = [];
    
    for (const { query, params } of queries) {
      const result = await client.query(query, params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Build dynamic WHERE clauses for filtering
export const buildWhereClause = (filters: Record<string, any>, startParamIndex = 1) => {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = startParamIndex;

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'search') {
        conditions.push(`(title ILIKE $${paramIndex++} OR customer_name ILIKE $${paramIndex++})`);
        params.push(`%${value}%`, `%${value}%`);
      } else if (Array.isArray(value)) {
        conditions.push(`$${paramIndex++} = ANY(${key})`);
        params.push(value);
      } else {
        conditions.push(`${key} = $${paramIndex++}`);
        params.push(value);
      }
    }
  });

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereClause, params, nextParamIndex: paramIndex };
};

// Pagination helper
export const buildPagination = (limit: number = 50, offset: number = 0) => {
  return {
    limit: Math.min(limit, 100), // Max 100 items per page
    offset: Math.max(offset, 0)
  };
};