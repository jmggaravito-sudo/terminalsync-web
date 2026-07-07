#!/usr/bin/env node

/**
 * MCP Server for TerminalSync Web
 * Provides Claude and AI tools with repository context and capabilities
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = __dirname;

class TerminalSyncMCPServer {
  constructor() {
    this.name = 'terminalsync-web-mcp';
    this.version = '1.0.0';
  }

  /**
   * Read a file from the repository
   */
  readFile(filePath) {
    const fullPath = path.join(REPO_ROOT, filePath);
    
    // Security: Prevent directory traversal
    if (!fullPath.startsWith(REPO_ROOT)) {
      throw new Error('Invalid file path');
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      return {
        success: true,
        content,
        path: filePath,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        path: filePath,
      };
    }
  }

  /**
   * List files in a directory
   */
  listFiles(directory = '.') {
    const fullPath = path.join(REPO_ROOT, directory);

    // Security: Prevent directory traversal
    if (!fullPath.startsWith(REPO_ROOT)) {
      throw new Error('Invalid directory path');
    }

    try {
      const files = fs.readdirSync(fullPath, { withFileTypes: true });
      const fileList = files
        .filter(file => !file.name.startsWith('.')) // Skip hidden files
        .map(file => ({
          name: file.name,
          type: file.isDirectory() ? 'directory' : 'file',
          path: path.join(directory, file.name),
        }));

      return {
        success: true,
        directory,
        files: fileList,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        directory,
      };
    }
  }

  /**
   * Search for patterns in the codebase
   */
  searchCodebase(query, fileType = null) {
    const results = [];
    
    const searchInDir = (dir) => {
      try {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        files.forEach(file => {
          // Skip node_modules, .git, and hidden directories
          if (['.git', 'node_modules', '.next', 'dist', '.vercel'].includes(file.name)) {
            return;
          }

          const fullPath = path.join(dir, file.name);
          const relativePath = path.relative(REPO_ROOT, fullPath);

          if (file.isDirectory()) {
            searchInDir(fullPath);
          } else {
            // Filter by file type if specified
            if (fileType && !file.name.endsWith(`.${fileType}`)) {
              return;
            }

            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              if (content.includes(query)) {
                results.push({
                  file: relativePath,
                  matches: (content.match(new RegExp(query, 'g')) || []).length,
                });
              }
            } catch (err) {
              // Skip files that can't be read
            }
          }
        });
      } catch (err) {
        // Skip directories that can't be read
      }
    };

    searchInDir(REPO_ROOT);

    return {
      success: true,
      query,
      fileType,
      results,
      count: results.length,
    };
  }

  /**
   * Get project information
   */
  getProjectInfo(infoType) {
    const infoMap = {
      'package.json': 'package.json',
      'tsconfig': 'tsconfig.json',
      'next.config': 'next.config.js',
      'env': '.env.local',
    };

    const filePath = infoMap[infoType];
    if (!filePath) {
      return {
        success: false,
        error: `Unknown info type: ${infoType}`,
      };
    }

    return this.readFile(filePath);
  }

  /**
   * Get project overview
   */
  getProjectOverview() {
    return {
      name: 'TerminalSync Web',
      description: 'Marketing site + Stripe checkout + affiliate program',
      technologies: ['Next.js 16', 'TypeScript', 'React', 'Stripe API', 'i18n (EN/ES)'],
      deployedAt: 'https://terminalsync-web.vercel.app',
      repository: 'https://github.com/jmggaravito-sudo/terminalsync-web',
      mainBranch: 'main',
    };
  }
}

// Export the server
export default TerminalSyncMCPServer;

// If running as a script
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new TerminalSyncMCPServer();
  console.log(`${server.name} v${server.version} initialized`);
  console.log('Available methods: readFile, listFiles, searchCodebase, getProjectInfo, getProjectOverview');
}
