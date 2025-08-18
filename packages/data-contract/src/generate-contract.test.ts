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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import { generateDataContract, prettify } from './generate-contract.js';

// Mock the 'fs' module
vi.mock('fs');

describe('Data Contract Generation', () => {
    const mockAuditData = {
        tables: [
            {
                tableName: 'cust_mst',
                columns: [
                    { columnName: 'c_id', dataType: 'integer' },
                    { columnName: 'c_name', dataType: 'character varying' },
                ],
            },
            {
                tableName: 'prod_items',
                columns: [
                    { columnName: 'p_id', dataType: 'integer' },
                    { columnName: 'p_name', dataType: 'text' },
                ],
            },
        ],
    };

    const expectedYaml = `tables:
  cust_mst:
    businessName: Cust Mst
    description: Description for Cust Mst
    columns:
      c_id:
        businessName: C Id
        description: Description for C Id
        dataType: integer
      c_name:
        businessName: C Name
        description: Description for C Name
        dataType: character varying
  prod_items:
    businessName: Prod Items
    description: Description for Prod Items
    columns:
      p_id:
        businessName: P Id
        description: Description for P Id
        dataType: integer
      p_name:
        businessName: P Name
        description: Description for P Name
        dataType: text
`;

    beforeEach(() => {
        // Provide a mock implementation for fs.readFileSync
        vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockAuditData));
        // Provide a mock implementation for fs.writeFileSync
        vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore the original implementations after each test
        vi.restoreAllMocks();
    });

    it('should transform audit JSON into the correct YAML structure', () => {
        generateDataContract('dummy_audit_path', 'dummy_contract_path');

        // Check if writeFileSync was called with the correct path and content
        expect(fs.writeFileSync).toHaveBeenCalledWith('dummy_contract_path', expectedYaml, 'utf8');
    });

    it('should call readFileSync with the correct audit path', () => {
        generateDataContract('dummy_audit_path', 'dummy_contract_path');

        // Verify that readFileSync was called with the correct path
        expect(fs.readFileSync).toHaveBeenCalledWith('dummy_audit_path', 'utf8');
    });

    describe('prettify', () => {
        it('should convert snake_case to Title Case', () => {
            expect(prettify('hello_world')).toBe('Hello World');
        });

        it('should handle single words', () => {
            expect(prettify('hello')).toBe('Hello');
        });

        it('should handle already capitalized words', () => {
            expect(prettify('HelloWorld')).toBe('HelloWorld');
        });
    });
});
