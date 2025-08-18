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
 * @fileoverview Provides a generic `RateLimiter` class for implementing rate limiting logic.
 * It supports configurable time windows, request limits, and automatic cleanup of expired entries.
 * @module src/utils/security/rateLimiter
 */
import { trace } from "@opentelemetry/api";
import { environment } from "../../config/index.js";
import { BaseErrorCode, McpError } from "../../types-global/errors.js";
import { logger, RequestContext, requestContextService } from "../index.js";

/**
 * Defines configuration options for the {@link RateLimiter}.
 */
export interface RateLimitConfig {
  /** Time window in milliseconds. */
  windowMs: number;
  /** Maximum number of requests allowed in the window. */
  maxRequests: number;
  /** Custom error message template. Can include `{waitTime}` placeholder. */
  errorMessage?: string;
  /** If true, skip rate limiting in development. */
  skipInDevelopment?: boolean;
  /** Optional function to generate a custom key for rate limiting. */
  keyGenerator?: (identifier: string, context?: RequestContext) => string;
  /** How often, in milliseconds, to clean up expired entries. */
  cleanupInterval?: number;
}

/**
 * Represents an individual entry for tracking requests against a rate limit key.
 */
export interface RateLimitEntry {
  /** Current request count. */
  count: number;
  /** When the window resets (timestamp in milliseconds). */
  resetTime: number;
}

/**
 * A generic rate limiter class using an in-memory store.
 * Controls frequency of operations based on unique keys.
 */
export class RateLimiter {
  /**
   * Stores current request counts and reset times for each key.
   * @private
   */
  private limits: Map<string, RateLimitEntry>;
  /**
   * Timer ID for periodic cleanup.
   * @private
   */
  private cleanupTimer: NodeJS.Timeout | null = null;

  /**
   * Default configuration values.
   * @private
   */
  private static DEFAULT_CONFIG: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    errorMessage:
      "Rate limit exceeded. Please try again in {waitTime} seconds.",
    skipInDevelopment: false,
    cleanupInterval: 5 * 60 * 1000, // 5 minutes
  };

  /**
   * Creates a new `RateLimiter` instance.
   * @param config - Configuration options, merged with defaults.
   */
  constructor(private config: RateLimitConfig) {
    this.config = { ...RateLimiter.DEFAULT_CONFIG, ...config };
    this.limits = new Map();
    this.startCleanupTimer();
  }

  /**
   * Starts the periodic timer to clean up expired rate limit entries.
   * @private
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    const interval =
      this.config.cleanupInterval ?? RateLimiter.DEFAULT_CONFIG.cleanupInterval;

    if (interval && interval > 0) {
      this.cleanupTimer = setInterval(() => {
        this.cleanupExpiredEntries();
      }, interval);

      if (this.cleanupTimer.unref) {
        this.cleanupTimer.unref(); // Allow Node.js process to exit if only timer active
      }
    }
  }

  /**
   * Removes expired rate limit entries from the store.
   * @private
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, entry] of this.limits.entries()) {
      if (now >= entry.resetTime) {
        this.limits.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      const logContext = requestContextService.createRequestContext({
        operation: "RateLimiter.cleanupExpiredEntries",
        cleanedCount: expiredCount,
        totalRemainingAfterClean: this.limits.size,
      });
      logger.debug(
        `Cleaned up ${expiredCount} expired rate limit entries`,
        logContext,
      );
    }
  }

  /**
   * Updates the configuration of the rate limiter instance.
   * @param config - New configuration options to merge.
   */
  public configure(config: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.cleanupInterval !== undefined) {
      this.startCleanupTimer();
    }
  }

  /**
   * Retrieves a copy of the current rate limiter configuration.
   * @returns The current configuration.
   */
  public getConfig(): RateLimitConfig {
    return { ...this.config };
  }

  /**
   * Resets all rate limits by clearing the internal store.
   */
  public reset(): void {
    this.limits.clear();
    const logContext = requestContextService.createRequestContext({
      operation: "RateLimiter.reset",
    });
    logger.debug("Rate limiter reset, all limits cleared", logContext);
  }

  /**
   * Checks if a request exceeds the configured rate limit.
   * Throws an `McpError` if the limit is exceeded.
   *
   * @param key - A unique identifier for the request source.
   * @param context - Optional request context for custom key generation.
   * @throws {McpError} If the rate limit is exceeded.
   */
  public check(key: string, context?: RequestContext): void {
    const activeSpan = trace.getActiveSpan();
    activeSpan?.setAttribute("mcp.rate_limit.checked", true);

    if (this.config.skipInDevelopment && environment === "development") {
      activeSpan?.setAttribute("mcp.rate_limit.skipped", "development");
      return;
    }

    const limitKey = this.config.keyGenerator
      ? this.config.keyGenerator(key, context)
      : key;
    activeSpan?.setAttribute("mcp.rate_limit.key", limitKey);

    const now = Date.now();
    let entry = this.limits.get(limitKey);

    if (!entry || now >= entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      this.limits.set(limitKey, entry);
    } else {
      entry.count++;
    }

    const remaining = Math.max(0, this.config.maxRequests - entry.count);
    activeSpan?.setAttributes({
      "mcp.rate_limit.limit": this.config.maxRequests,
      "mcp.rate_limit.count": entry.count,
      "mcp.rate_limit.remaining": remaining,
    });

    if (entry.count > this.config.maxRequests) {
      const waitTime = Math.ceil((entry.resetTime - now) / 1000);
      const errorMessage = (
        this.config.errorMessage || RateLimiter.DEFAULT_CONFIG.errorMessage!
      ).replace("{waitTime}", waitTime.toString());

      activeSpan?.addEvent("rate_limit_exceeded", {
        "mcp.rate_limit.wait_time_seconds": waitTime,
      });

      throw new McpError(BaseErrorCode.RATE_LIMITED, errorMessage, {
        waitTimeSeconds: waitTime,
        key: limitKey,
        limit: this.config.maxRequests,
        windowMs: this.config.windowMs,
      });
    }
  }

  /**
   * Retrieves the current rate limit status for a specific key.
   * @param key - The rate limit key.
   * @returns Status object or `null` if no entry exists.
   */
  public getStatus(key: string): {
    current: number;
    limit: number;
    remaining: number;
    resetTime: number;
  } | null {
    const entry = this.limits.get(key);
    if (!entry) {
      return null;
    }
    return {
      current: entry.count,
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Stops the cleanup timer and clears all rate limit entries.
   * Call when the rate limiter is no longer needed.
   */
  public dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.limits.clear();
  }
}

/**
 * Default singleton instance of the `RateLimiter`.
 * Initialized with default configuration. Use `rateLimiter.configure({})` to customize.
 */
export const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // Default: 15 minutes
  maxRequests: 100, // Default: 100 requests per window
});
