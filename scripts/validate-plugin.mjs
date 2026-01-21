#!/usr/bin/env node

/**
 * Claude Code Plugin Schema Validation Script
 *
 * Validates that plugin configuration files conform to the Claude Code plugin
 * schema specifications.
 *
 * Usage: node scripts/validate-plugin.mjs
 *
 * Documentation: https://code.claude.com/docs/en/plugins
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = join(__dirname, '..')

let errors = []
let warnings = []

function error(msg) {
  errors.push(`❌ ${msg}`)
}

function warn(msg) {
  warnings.push(`⚠️  ${msg}`)
}

function success(msg) {
  console.log(`✅ ${msg}`)
}

function readJSON(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch (e) {
    return null
  }
}

// =============================================================================
// plugin.json validation
// =============================================================================

console.log('\n📋 Validating .claude-plugin/plugin.json...\n')

const pluginJsonPath = join(ROOT_DIR, '.claude-plugin', 'plugin.json')

if (!existsSync(pluginJsonPath)) {
  error('plugin.json not found at .claude-plugin/plugin.json')
} else {
  const pluginJson = readJSON(pluginJsonPath)

  if (!pluginJson) {
    error('plugin.json is not valid JSON')
  } else {
    // Required fields
    if (!pluginJson.name || typeof pluginJson.name !== 'string') {
      error('plugin.json: "name" is required and must be a string')
    } else {
      success(`plugin.json: name = "${pluginJson.name}"`)
    }

    if (!pluginJson.description || typeof pluginJson.description !== 'string') {
      error('plugin.json: "description" is required and must be a string')
    } else {
      success('plugin.json: description is present')
    }

    if (!pluginJson.version || typeof pluginJson.version !== 'string') {
      error('plugin.json: "version" is required and must be a string')
    } else if (!/^\d+\.\d+\.\d+/.test(pluginJson.version)) {
      warn(`plugin.json: version "${pluginJson.version}" should follow semver`)
    } else {
      success(`plugin.json: version = "${pluginJson.version}"`)
    }

    // Optional fields schema compliance
    if (pluginJson.author) {
      if (typeof pluginJson.author !== 'object') {
        error('plugin.json: "author" must be an object')
      } else {
        if (pluginJson.author.url) {
          error('plugin.json: "author.url" is not a valid field (only "name" is allowed)')
        }
        if (pluginJson.author.email) {
          warn('plugin.json: "author.email" may not be supported')
        }
        if (pluginJson.author.name) {
          success(`plugin.json: author.name = "${pluginJson.author.name}"`)
        }
      }
    }

    if (pluginJson.repository && typeof pluginJson.repository !== 'string') {
      error('plugin.json: "repository" must be a string, not an object')
    }

    if (pluginJson.keywords) {
      error('plugin.json: "keywords" is not valid in plugin.json (only in marketplace.json)')
    }

    // Check for unknown fields
    const validPluginFields = ['name', 'description', 'version', 'author', 'homepage', 'repository', 'license']
    for (const field of Object.keys(pluginJson)) {
      if (!validPluginFields.includes(field)) {
        warn(`plugin.json: unknown field "${field}" may be ignored`)
      }
    }
  }
}

// =============================================================================
// marketplace.json validation
// =============================================================================

console.log('\n📋 Validating .claude-plugin/marketplace.json...\n')

const marketplaceJsonPath = join(ROOT_DIR, '.claude-plugin', 'marketplace.json')

if (!existsSync(marketplaceJsonPath)) {
  error('marketplace.json not found at .claude-plugin/marketplace.json')
} else {
  const marketplaceJson = readJSON(marketplaceJsonPath)

  if (!marketplaceJson) {
    error('marketplace.json is not valid JSON')
  } else {
    // Required fields
    if (!marketplaceJson.name || typeof marketplaceJson.name !== 'string') {
      error('marketplace.json: "name" is required and must be a string')
    } else {
      if (!/^[a-z0-9-]+$/.test(marketplaceJson.name)) {
        error('marketplace.json: "name" must be kebab-case (lowercase, hyphens only)')
      }

      const reservedNames = [
        'claude-code-marketplace', 'claude-code-plugins', 'claude-plugins-official',
        'anthropic-marketplace', 'anthropic-plugins', 'agent-skills', 'life-sciences'
      ]
      if (reservedNames.includes(marketplaceJson.name)) {
        error(`marketplace.json: "${marketplaceJson.name}" is a reserved name`)
      } else {
        success(`marketplace.json: name = "${marketplaceJson.name}"`)
      }
    }

    if (!marketplaceJson.owner || typeof marketplaceJson.owner !== 'object') {
      error('marketplace.json: "owner" is required and must be an object')
    } else if (!marketplaceJson.owner.name) {
      error('marketplace.json: "owner.name" is required')
    } else {
      success(`marketplace.json: owner.name = "${marketplaceJson.owner.name}"`)
    }

    if (!marketplaceJson.plugins || !Array.isArray(marketplaceJson.plugins)) {
      error('marketplace.json: "plugins" is required and must be an array')
    } else if (marketplaceJson.plugins.length === 0) {
      error('marketplace.json: "plugins" array is empty')
    } else {
      success(`marketplace.json: ${marketplaceJson.plugins.length} plugin(s) defined`)

      // Validate each plugin entry
      const names = []
      for (let i = 0; i < marketplaceJson.plugins.length; i++) {
        const plugin = marketplaceJson.plugins[i]
        const prefix = `marketplace.json plugins[${i}]`

        if (!plugin.name || typeof plugin.name !== 'string') {
          error(`${prefix}: "name" is required`)
        } else {
          if (names.includes(plugin.name)) {
            error(`${prefix}: duplicate plugin name "${plugin.name}"`)
          }
          names.push(plugin.name)
        }

        if (!plugin.source) {
          error(`${prefix}: "source" is required`)
        } else if (typeof plugin.source === 'string') {
          if (plugin.source.includes('..')) {
            error(`${prefix}: source path cannot contain ".." (path traversal)`)
          }
          success(`${prefix}: source = "${plugin.source}"`)
        } else if (typeof plugin.source === 'object') {
          if (!plugin.source.source) {
            error(`${prefix}: source object must have "source" field`)
          }
          success(`${prefix}: source is an object (${plugin.source.source})`)
        }

        if (plugin.author && typeof plugin.author === 'object' && !plugin.author.name) {
          error(`${prefix}: "author.name" is required when author is specified`)
        }

        if (plugin.repository && typeof plugin.repository !== 'string') {
          error(`${prefix}: "repository" must be a string`)
        }

        if (plugin.mcpServers) {
          if (typeof plugin.mcpServers === 'string') {
            const mcpPath = join(ROOT_DIR, plugin.mcpServers.replace(/^\.\//, ''))
            if (!existsSync(mcpPath)) {
              error(`${prefix}: mcpServers path "${plugin.mcpServers}" does not exist`)
            } else {
              success(`${prefix}: mcpServers = "${plugin.mcpServers}"`)
            }
          } else if (typeof plugin.mcpServers === 'object') {
            const serverCount = Object.keys(plugin.mcpServers).length
            success(`${prefix}: mcpServers has ${serverCount} inline server(s)`)

            // Validate inline mcpServers
            for (const [serverName, serverConfig] of Object.entries(plugin.mcpServers)) {
              const sc = serverConfig
              if (sc.type === 'http' || sc.type === 'sse') {
                if (!sc.url) {
                  error(`${prefix} mcpServers.${serverName}: "url" is required for ${sc.type} type`)
                }
              }
            }
          }
        }
      }
    }
  }
}

// =============================================================================
// .mcp.json validation
// =============================================================================

console.log('\n📋 Validating .mcp.json...\n')

const mcpJsonPath = join(ROOT_DIR, '.mcp.json')

if (!existsSync(mcpJsonPath)) {
  warn('.mcp.json not found (optional)')
} else {
  const mcpJson = readJSON(mcpJsonPath)

  if (!mcpJson) {
    error('.mcp.json is not valid JSON')
  } else if (!mcpJson.mcpServers || typeof mcpJson.mcpServers !== 'object') {
    error('.mcp.json: "mcpServers" object is required')
  } else {
    const servers = Object.entries(mcpJson.mcpServers)
    success(`.mcp.json: ${servers.length} server(s) defined`)

    const validHttpFields = ['type', 'url', 'headers']
    const validStdioFields = ['type', 'command', 'args', 'env']

    for (const [name, server] of servers) {
      const s = server
      const prefix = `.mcp.json "${name}"`

      if (s.type === 'http' || s.type === 'sse') {
        if (!s.url) {
          error(`${prefix}: "url" is required for ${s.type} type`)
        } else if (!/^https?:\/\//.test(s.url)) {
          error(`${prefix}: "url" must start with http:// or https://`)
        }

        // Check for invalid fields
        for (const field of Object.keys(s)) {
          if (!validHttpFields.includes(field)) {
            warn(`${prefix}: "${field}" is not a standard field for ${s.type} servers`)
          }
        }
      } else if (s.type === 'stdio') {
        if (!s.command) {
          error(`${prefix}: "command" is required for stdio type`)
        }

        for (const field of Object.keys(s)) {
          if (!validStdioFields.includes(field)) {
            warn(`${prefix}: "${field}" is not a standard field for stdio servers`)
          }
        }
      }

      if (s.headers && typeof s.headers !== 'object') {
        error(`${prefix}: "headers" must be an object`)
      }
    }
  }
}

// =============================================================================
// skills/ directory validation
// =============================================================================

console.log('\n📋 Validating skills/ directory...\n')

const skillsDir = join(ROOT_DIR, 'skills')

if (!existsSync(skillsDir)) {
  warn('skills/ directory not found (optional)')
} else {
  const skillDirs = readdirSync(skillsDir).filter(f =>
    statSync(join(skillsDir, f)).isDirectory()
  )

  if (skillDirs.length === 0) {
    warn('skills/ directory is empty')
  } else {
    success(`skills/: ${skillDirs.length} skill(s) found`)

    for (const skillDir of skillDirs) {
      const skillMdPath = join(skillsDir, skillDir, 'SKILL.md')
      const prefix = `skills/${skillDir}`

      if (!existsSync(skillMdPath)) {
        error(`${prefix}: SKILL.md not found`)
      } else {
        const content = readFileSync(skillMdPath, 'utf-8')

        if (!content.startsWith('---')) {
          error(`${prefix}/SKILL.md: must start with YAML frontmatter (---)`)
        } else {
          const secondDelimiter = content.indexOf('---', 3)
          if (secondDelimiter < 0) {
            error(`${prefix}/SKILL.md: missing closing frontmatter delimiter`)
          } else {
            const frontmatter = content.slice(4, secondDelimiter)
            if (!frontmatter.includes('description:')) {
              warn(`${prefix}/SKILL.md: frontmatter should have "description" field`)
            } else {
              success(`${prefix}/SKILL.md: valid`)
            }
          }
        }
      }
    }
  }
}

// =============================================================================
// Summary
// =============================================================================

console.log('\n' + '='.repeat(60))
console.log('VALIDATION SUMMARY')
console.log('='.repeat(60) + '\n')

if (warnings.length > 0) {
  console.log('Warnings:')
  warnings.forEach(w => console.log(`  ${w}`))
  console.log()
}

if (errors.length > 0) {
  console.log('Errors:')
  errors.forEach(e => console.log(`  ${e}`))
  console.log()
  console.log(`❌ Validation failed with ${errors.length} error(s)`)
  process.exit(1)
} else {
  console.log('✅ All validations passed!')
  process.exit(0)
}
