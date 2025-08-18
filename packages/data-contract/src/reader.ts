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

import * as fs from 'fs';
import * as yaml from 'js-yaml';

// Define the expected structure for a column
export interface Column {
    businessName: string;
    description: string;
    dataType: string;
    businessRules?: string[];
}

// Define the expected structure for a table
export interface Table {
    businessName: string;
    description: string;
    columns: { [key: string]: Column };
}

// Define the expected structure for a tool
export interface Tool {
    description: string;
    readOnlyHint: boolean;
    input_schema: object;
    response_schema: object;
}

// Define the expected structure for the data contract
export interface DataContract {
    tables: { [key: string]: Table };
    abbreviations?: { [key: string]: string };
    tools?: { [key: string]: Tool };
}

export function readDataContract(contractPath: string): DataContract {
    if (!fs.existsSync(contractPath)) {
        throw new Error(`Data contract file not found at: ${contractPath}`);
    }

    const fileContents = fs.readFileSync(contractPath, 'utf8');
    return yaml.load(fileContents) as DataContract;
}
