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
 * @fileoverview Defines local OpenTelemetry semantic convention constants to ensure
 * stability and avoid dependency conflicts with different versions of
 * `@opentelemetry/semantic-conventions`.
 * @module src/utils/telemetry/semconv
 */

/**
 * The method or function name, or equivalent (usually rightmost part of the code unit's name).
 */
export const ATTR_CODE_FUNCTION = "code.function";

/**
 * The "namespace" within which `code.function` is defined.
 * Usually the qualified class or module name, etc.
 */
export const ATTR_CODE_NAMESPACE = "code.namespace";
