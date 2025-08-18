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
 * @fileoverview Barrel file for the `echo` resource.
 * This file serves as the public interface for the echo resource module,
 * primarily exporting the `registerEchoResource` function. This function is
 * responsible for registering the echo resource, including its templates and handler,
 * with an MCP server instance. This makes the resource accessible to clients
 * via defined URI patterns.
 *
 * Consuming modules should import from this barrel file to access
 * the echo resource's registration capabilities.
 * @module src/mcp-server/resources/echoResource/index
 */

export { registerEchoResource } from "./registration.js";
