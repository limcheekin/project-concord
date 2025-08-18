/**
 * Copyright (c) 2025 Lim Chee Kin
 *
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the LICENSE file in the root directory
 * of this source tree or from the following URL:
 *
 *     https://github.com/limcheekin/project-concord/blob/main/LICENSE
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { z } from 'zod';
import { McpError } from '../../../utils/internal/mcpError.js';
import { BaseErrorCode } from '../../../types-global/BaseErrorCode.js';
import { DataContract } from 'data-contract';

// This is a simplified NLP parser. A real implementation would use a more
// sophisticated library, but this demonstrates the principle of separating
// parsing from query building.
function parseDescription(description: string) {
  const supportedPatterns = [
    {
      // Example: "show me the customer name for the customer with id 123"
      // Updated to be more flexible with table and column names.
      regex: /show me the (.*?) for the (.*?) with id (\d+)/i,
      entities: (matches: RegExpMatchArray) => ({
        target: matches[2].trim(),
        columns: [matches[1].trim()],
        filters: [{ column: 'id', operator: '=', value: matches[3] }],
      }),
    },
    {
        // Example: "Which sales orders are cancelled?"
        regex: /which sales orders are (.*?)\??$/i,
        entities: (matches: RegExpMatchArray) => ({
            target: 'sales orders',
            columns: ['id'],
            filters: [{ column: 'status', operator: '=', value: matches[1].trim() }],
        }),
    },
    {
        // Example: "List all products in the 'Product Catalog'."
        regex: /list all (.*?) in the (?:'|")(.*?)(?:'|")/i,
        entities: (matches: RegExpMatchArray) => ({
            target: matches[2].trim(),
            columns: ['*'],
            filters: [],
        }),
    },
    {
        // Example: "What is the name of the product with ID 102?"
        regex: /what is the name of the (.*?) with id (\d+)\??$/i,
        entities: (matches: RegExpMatchArray) => ({
            target: matches[1].trim(),
            columns: ['name'],
            filters: [{ column: 'id', operator: '=', value: matches[2].trim() }],
        }),
    },
    {
        // Example: "What was the quantity of each product sold in order number 1001?"
        regex: /what was the quantity of each product sold in order number (\d+)\??$/i,
        entities: (_matches: RegExpMatchArray) => {
            throw new McpError(
                BaseErrorCode.UNSUPPORTED_OPERATION,
                'That request is not supported by the query builder yet. Try rephrasing or pick from the supported set.',
                {}
            );
        },
    },
    {
        // Example: "Find the name of the customer who placed order number 1004."
        regex: /find the name of the customer who placed order number (\d+)\??$/i,
        entities: (_matches: RegExpMatchArray) => {
            throw new McpError(
                BaseErrorCode.UNSUPPORTED_OPERATION,
                'That request is not supported by the query builder yet. Try rephrasing or pick from the supported set.',
                {}
            );
        },
    }
  ];

  for (const pattern of supportedPatterns) {
    const matches = description.match(pattern.regex);
    if (matches) {
      return pattern.entities(matches);
    }
  }

  return null;
}

function findTableByBusinessName(contract: DataContract, businessName: string) {
    for (const tableName in contract.tables) {
        if (contract.tables[tableName].businessName.toLowerCase().includes(businessName.toLowerCase())) {
            return { physicalName: tableName, table: contract.tables[tableName] };
        }
    }
    return null;
}

function findColumnByBusinessName(table: any, businessName: string) {
    // a more robust implementation would handle synonyms, but for now we do a case-insensitive search
    // and also check for special cases like 'id' and 'status'
    const lowerBusinessName = businessName.toLowerCase();
    if (lowerBusinessName === 'id') {
        for (const columnName in table.columns) {
            if (columnName.endsWith('_id') || columnName === 'id') {
                return { physicalName: columnName, column: table.columns[columnName] };
            }
        }
    }

    if (lowerBusinessName === 'status') {
        for (const columnName in table.columns) {
            if (columnName.endsWith('_stat') || columnName.endsWith('_status')) {
                return { physicalName: columnName, column: table.columns[columnName] };
            }
        }
    }

    for (const columnName in table.columns) {
        if (table.columns[columnName].businessName.toLowerCase().includes(lowerBusinessName)) {
            return { physicalName: columnName, column: table.columns[columnName] };
        }
    }
    return null;
}

function findColumnValueFromBusinessRule(column: any, value: string) {
    const lowerValue = value.toLowerCase();
    for (const rule of column.businessRules) {
        const regex = /(\d+):\s*'(.*?)'/g;
        let match;
        while ((match = regex.exec(rule)) !== null) {
            if (match[2].toLowerCase() === lowerValue) {
                return parseInt(match[1], 10);
            }
        }
    }
    return value;
}


export const buildQueryFromDescriptionInputSchema = z.object({
  description: z.string(),
}).strict();

export const buildQueryFromDescriptionOutputSchema = z.object({
  sql_query: z.string(),
  params: z.array(z.union([z.string(), z.number()])),
}).strict();

export async function buildQueryFromDescriptionLogic(
  contract: DataContract,
  input: z.infer<typeof buildQueryFromDescriptionInputSchema>
): Promise<z.infer<typeof buildQueryFromDescriptionOutputSchema>> {
  const parsed = parseDescription(input.description);

  if (!parsed) {
    throw new McpError(
      BaseErrorCode.UNSUPPORTED_OPERATION,
      'That request is not supported by the query builder yet. Try rephrasing or pick from the supported set.',
      {}
    );
  }

  const tableInfo = findTableByBusinessName(contract, parsed.target);
  if (!tableInfo) {
      throw new McpError(BaseErrorCode.INVALID_INPUT, `Could not find a table matching '${parsed.target}'.`, {});
  }

  const selectColumns = parsed.columns.map(colName => {
      if (colName === '*') {
          return Object.keys(tableInfo.table.columns).map(c => c).join(', ');
      }
      const colInfo = findColumnByBusinessName(tableInfo.table, colName);
      if (!colInfo) {
          throw new McpError(BaseErrorCode.INVALID_INPUT, `Could not find a column matching '${colName}' in table '${tableInfo.physicalName}'.`, {});
      }
      return colInfo.physicalName;
  });

  const whereClauses: string[] = [];
  const params: (string | number)[] = [];

  parsed.filters.forEach(filter => {
      const colInfo = findColumnByBusinessName(tableInfo.table, filter.column);
      if (!colInfo) {
          throw new McpError(BaseErrorCode.INVALID_INPUT, `Could not find a column matching '${filter.column}' in table '${tableInfo.physicalName}'.`, {});
      }

      let filterValue: string | number = filter.value;
      // if the column has business rules, try to find the mapped value
      if (colInfo.column.businessRules && colInfo.column.businessRules.length > 0) {
          filterValue = findColumnValueFromBusinessRule(colInfo.column, filter.value) ?? filter.value;
      }

      whereClauses.push(`${colInfo.physicalName} ${filter.operator} ?`);
      params.push(filterValue);
  });

  let sql_query = `SELECT ${selectColumns.join(', ')} FROM ${tableInfo.physicalName}`;
  if (whereClauses.length > 0) {
    sql_query += ` WHERE ${whereClauses.join(' AND ')}`;
  }
  sql_query += ';';


  return { sql_query, params };
}
