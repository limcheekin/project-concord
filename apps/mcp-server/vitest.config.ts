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

import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ["./tsconfig.vitest.json"] })],
  test: {
    globals: true,
    environment: "node",
    pool: "forks",
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 15000,
    deps: {
      inline: true,
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/index.ts",
        "src/agent/cli/boot.ts",
        "src/types-global/**",
        "**/*.d.ts",
        "**/index.ts",
        "src/mcp-server/resources/**",
        "src/mcp-client/client-config/mcp-config.json.example",
      ],
    },
    dir: "tests",
  },
});
