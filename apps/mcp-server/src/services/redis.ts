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

import { Redis } from 'ioredis';
import { config } from "../config/index.js";

// Build Redis URL from environment variables or use default
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';
const redisUrl = config.redisUrl || `redis://${redisHost}:${redisPort}`;

/**
 * A singleton Redis client instance for use throughout the application.
 *
 * It uses 'lazyConnect' to prevent connection attempts until the first command is issued.
 * This is beneficial in environments where the server might start before the cache is ready,
 * and it simplifies testing by not requiring a live Redis connection for all test suites.
 */
const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 3, // Prevent indefinite hangs if Redis is down
  connectTimeout: 5000, // 5 second timeout for connection
  commandTimeout: 5000, // 5 second timeout for commands
});

redis.on('error', (err: any) => {
  // Log Redis errors to the console.
  // In a production environment, this should be integrated with a proper logging service.
  console.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  console.log('Redis client connected successfully');
});

redis.on('ready', () => {
  console.log('Redis client ready to accept commands');
});

redis.on('close', () => {
  console.log('Redis client connection closed');
});

redis.on('reconnecting', () => {
  console.log('Redis client reconnecting...');
});

export default redis;
