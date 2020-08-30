import * as path from 'path';
const shell = require('shelljs');
import { Set } from 'immutable';
import { LocalsObject } from 'pug';
import logger, { logFatalAndTerminate } from './logger';
import { compilePath, compileTemplateString } from './template';

export const resolvePaths = (
  pathGlobs: Array<string>,
  regexFilters: Array<RegExp>
): Set<string> => {
  if (pathGlobs.length) {
    const findResult = shell.find(pathGlobs) || [];
    const filteredResult = findResult.filter(
      path => !regexFilters.some(exclude => path.match(exclude))
    );
    return Set(filteredResult);
  }
  return Set();
};

export const resolveFilePath = (
  pathName: string,
  fileName: string,
  properties?: LocalsObject
): string | undefined => {
  const absoluteOutputPath = compilePath(pathName, properties);

  if (!shell.test('-d', absoluteOutputPath)) {
    try {
      logger.info(
        'Output path does not exist. Creating directory at: %s',
        absoluteOutputPath
      );

      shell.mkdir('-p', absoluteOutputPath);
    } catch (e) {
      logger.error(
        'Error: Unable to create directory from resolved path: %s',
        absoluteOutputPath
      );

      logFatalAndTerminate(e);
    }
  }

  return path.join(absoluteOutputPath, compileTemplateString(fileName, properties));
};

export const writeFile = (filePath: string, content: string) => {
  try {
    logger.info('Writing file to path %s...', filePath);
    shell.cat(filePath).to(content);
    logger.success('Successfully generated %s.', path.basename(filePath));
  } catch (e) {
    logFatalAndTerminate(e);
  }
};
