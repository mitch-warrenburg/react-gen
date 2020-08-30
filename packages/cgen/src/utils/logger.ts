import * as path from 'path';
const shell = require('shelljs');
import * as signale from 'signale';
import { JobConfig } from '../types';

const _logger = signale;

const logger = {
  error: (message: unknown, ...args: unknown[]) => {
    _logger.error(message, ...args);
  },
  fatal: (message: unknown, ...args: unknown[]) => {
    _logger.fatal(message, ...args);
  },
  warn: (message: unknown, ...args: unknown[]) => {
    _logger.warn(message, ...args);
  },
  info: (message: unknown, ...args: unknown[]) => {
    _logger.info(message, ...args);
  },
  success: (message: unknown, ...args: unknown[]) => {
    _logger.success(message, ...args);
  },
  complete: (message: unknown, ...args: unknown[]) => {
    _logger.complete(message, ...args);
  },
  pending: (message: unknown, ...args: unknown[]) => {
    _logger.pending(message, ...args);
  },
};

export const logFatalAndTerminate = (error: Error) => {
  logger.fatal(error);
  shell.exit(1);
};

export const logGeneratedContent = (templatePath: string, content: string) => {
  logger.success(`Generated the following content from template: ${path.basename(
    templatePath
  )}.
      
---------------------------------
  
${content}
---------------------------------  
`);
};

export const logCgenConfig = (resolvedJobConfig: JobConfig) => {
  logger.info(`Resolved job configuration: 

${JSON.stringify(resolvedJobConfig, null, 4)}`);
};

export default logger;
