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

import { MiddlewareHandler } from 'hono';
import { logger, requestContextService } from '../../../utils/index.js';

export const loggingMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const context = requestContextService.createRequestContext({
      operation: 'loggingMiddleware',
      method: c.req.method,
      url: c.req.url,
    });

    let requestBody: any = null;

    // Only try to parse JSON for POST requests with JSON content type
    const contentType = c.req.header('content-type');
    if (c.req.method === 'POST' && contentType?.includes('application/json')) {
      try {
        requestBody = await c.req.json();
      } catch (error) {
        logger.warning('Failed to parse request body as JSON', {
          ...context,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    logger.info('Incoming HTTP Request', {
      ...context,
      headers: c.req.header(),
      body: requestBody,
    });

    await next();

    logger.info('Outgoing HTTP Response', {
        ...context,
        status: c.res.status,
        headers: c.res.headers,
    });
  };
};
