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
import * as path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { readDataContract } from '../src/reader';
import {
  getDataContractTable,
  generateMarkdown,
} from '../src/documentation-generator';
import { YAMLException } from 'js-yaml';

const argv = yargs(hideBin(process.argv))
  .option('table', {
    alias: 't',
    description: 'The name of the table to generate documentation for',
    type: 'string',
    demandOption: true,
  })
  .option('contract', {
    alias: 'c',
    description: 'Path to the data contract file',
    type: 'string',
    default: path.resolve(
      process.cwd(),
      '../datacontract.yml',
    ),
  })
  .option('output', {
    alias: 'o',
    description: 'Path to the output directory',
    type: 'string',
    default: path.resolve(process.cwd(), '../../docs/generated'),
  })
  .help()
  .alias('help', 'h').argv;

function main() {
  try {
    const tableName = (argv.table as string).toLowerCase();
    const contractPath = path.resolve(argv.contract);
    const dataContract = readDataContract(contractPath);
    const tableData = getDataContractTable(dataContract, tableName);

    if (!tableData) {
      console.error(`Table "${tableName}" not found in the data contract.`);
      process.exit(1);
    }

    const markdown = generateMarkdown(tableData);
    const outputDir = path.resolve(argv.output);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${tableName}.md`);
    fs.writeFileSync(outputPath, markdown);

    console.log(
      `Documentation for table "${tableName}" generated at: ${outputPath}`,
    );
  } catch (error) {
    if (error instanceof YAMLException) {
      console.error('Error parsing YAML file:', error.message);
    } else if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('An unknown error occurred.');
    }
    process.exit(1);
  }
}

main();
