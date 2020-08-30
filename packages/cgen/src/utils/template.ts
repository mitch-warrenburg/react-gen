const pug = require('pug');
import * as path from 'path';
import { LocalsObject, Options } from 'pug';
import logger, { logFatalAndTerminate } from './logger';

export const compilePath = (pathName: string, properties?: LocalsObject) => {
  const absolutePath = path.resolve(pathName);
  try {
    return properties ? compileTemplateString(absolutePath, properties) : absolutePath;
  } catch (e) {
    logger.error('Error: Unable to compile path from provided template string: %s', path);
    logFatalAndTerminate(e);
  }
};

export const compileTemplateString = (template: string, properties = {}) => {
  try {
    return pug.render(`|${template}`, properties);
  } catch (e) {
    logger.error('Error: Unable to compile provided template string: %s', template);
    logFatalAndTerminate(e);
  }
};

export const compileTemplateFile = (
  templatePath: string,
  properties: LocalsObject,
  pugOptions?: Options
) => {
  try {
    return pug.compileFile(templatePath, pugOptions)(properties);
  } catch (e) {
    logger.error('Error: Unable to compile provided tempate file. Path:', templatePath);
    logFatalAndTerminate(e);
  }
};
