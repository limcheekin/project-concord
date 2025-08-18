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
 * @fileoverview Defines the AsyncLocalStorage context for authentication information.
 * This module provides a mechanism to store and retrieve authentication details
 * (like scopes and client ID) across asynchronous operations, making it available
 * from the middleware layer down to the tool and resource handlers without
 * drilling props.
 *
 * @module src/mcp-server/transports/auth/core/authContext
 */

import { AsyncLocalStorage } from "async_hooks";
import type { AuthInfo } from "./authTypes.js";

/**
 * Defines the structure of the store used within the AsyncLocalStorage.
 * It holds the authentication information for the current request context.
 */
interface AuthStore {
  authInfo: AuthInfo;
}

/**
 * An instance of AsyncLocalStorage to hold the authentication context (`AuthStore`).
 * This allows `authInfo` to be accessible throughout the async call chain of a request
 * after being set in the authentication middleware.
 *
 * @example
 * // In middleware:
 * await authContext.run({ authInfo }, next);
 *
 * // In a deeper handler:
 * const store = authContext.getStore();
 * const scopes = store?.authInfo.scopes;
 */
export const authContext = new AsyncLocalStorage<AuthStore>();
