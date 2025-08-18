# Copyright (c) 2025 Lim Chee Kin
#
# Licensed under the Business Source License 1.1 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the LICENSE file in the root directory
# of this source tree or from the following URL:
#
#     https://github.com/limcheekin/project-concord/blob/main/LICENSE
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# ---- Base Node ----
# Use a specific Node.js version known to work, Alpine for smaller size
FROM node:24.5.0-alpine AS base
WORKDIR /usr/src/app
ENV NODE_ENV=production

# ---- Builder ----
# Build the application, includes dev dependencies.
FROM base AS builder
WORKDIR /usr/src/app
# Copy dependency manifests
COPY package.json package-lock.json* ./
COPY apps/mcp-server/package.json ./apps/mcp-server/
COPY packages/data-contract/package.json ./packages/data-contract/
# Install all dependencies
RUN npm install
# Copy the rest of the source code
COPY . .
# Build the data-contract package first (dependency)
RUN npm run build --workspace=data-contract
# Build the TypeScript project
RUN npm run build --workspace=mcp-server

# ---- Runner ----
# Final stage with only production dependencies and built code
FROM base AS runner
WORKDIR /usr/src/app
# Copy node_modules from the 'builder' stage (includes all dependencies)
COPY --from=builder /usr/src/app/node_modules ./node_modules
# Copy built application from the 'builder' stage
COPY --from=builder /usr/src/app/apps/mcp-server/dist ./apps/mcp-server/dist
# Copy built data-contract package (local dependency)
COPY --from=builder /usr/src/app/packages/data-contract ./packages/data-contract/
# Copy package.json files needed for runtime
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/apps/mcp-server/package.json ./apps/mcp-server/package.json
# Remove dev dependencies in the final stage
RUN npm prune --omit=dev

# Create a non-root user and switch to it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /usr/src/app
USER appuser

# Expose port if the application runs a server (adjust if needed)
ENV MCP_TRANSPORT_TYPE=http
EXPOSE 3010

# Command to run the application
# This will execute the binary defined in package.json
CMD ["node", "apps/mcp-server/dist/index.js"]
