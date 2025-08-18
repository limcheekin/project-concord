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
 * @fileoverview Provides a utility for converting HTTP headers between Node.js
 * and Web Standards formats, ensuring compliance and correctness.
 * @module src/mcp-server/transports/core/headerUtils
 */

import type { OutgoingHttpHeaders } from "http";

/**
 * Converts Node.js-style OutgoingHttpHeaders to a Web-standard Headers object.
 *
 * This function is critical for interoperability between Node.js's `http` module
 * and Web APIs like Fetch and Hono. It correctly handles multi-value headers
 * (e.g., `Set-Cookie`), which Node.js represents as an array of strings, by
 * using the `Headers.append()` method. Standard single-value headers are set
 * using `Headers.set()`.
 *
 * @param nodeHeaders - The Node.js-style headers object to convert.
 * @returns A Web-standard Headers object.
 */
export function convertNodeHeadersToWebHeaders(
  nodeHeaders: OutgoingHttpHeaders,
): Headers {
  const webHeaders = new Headers();
  for (const [key, value] of Object.entries(nodeHeaders)) {
    // Skip undefined headers, which are valid in Node.js but not in Web Headers.
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      // For arrays, append each value to support multi-value headers.
      for (const v of value) {
        webHeaders.append(key, String(v));
      }
    } else {
      // For single values, set the header, overwriting any existing value.
      webHeaders.set(key, String(value));
    }
  }
  return webHeaders;
}
