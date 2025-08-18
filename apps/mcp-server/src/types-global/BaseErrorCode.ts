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

export enum BaseErrorCode {
    // General Errors
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    INVALID_INPUT = 'INVALID_INPUT',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    BAD_GATEWAY = 'BAD_GATEWAY',
    SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
    GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',

    // MCP Specific Errors
    UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION',
    INVALID_SESSION = 'INVALID_SESSION',
    SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
    INVALID_TRANSPORT = 'INVALID_TRANSPORT',
  }
