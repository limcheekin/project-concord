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

/**
 * @fileoverview Barrel file for the utils module.
 * This file re-exports all utilities from their categorized subdirectories,
 * providing a single entry point for accessing utility functions.
 * @module src/utils
 */

// Re-export all utilities from their categorized subdirectories
export * from "./internal/index.js";
export * from "./metrics/index.js";
export * from "./parsing/index.js";
export * from "./security/index.js";
export * from "./network/index.js";
export * from "./scheduling/index.js";

// It's good practice to have index.ts files in each subdirectory
// that export the contents of that directory.
// Assuming those will be created or already exist.
// If not, this might need adjustment to export specific files, e.g.:
// export * from './internal/errorHandler.js';
// export * from './internal/logger.js';
// ... etc.
