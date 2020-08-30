const path = require('path');
const shell = require('shelljs');
import { LocalsObject } from 'pug';
import {
  JobConfig,
  CgenConfig,
  CgenCliInput,
  CgenCliOptions,
  TemplatesConfig,
  ProjectArchetypeName,
} from '../types';
import {
  logger,
  mergeDeep,
  writeFile,
  resolvePaths,
  logCgenConfig,
  resolveFilePath,
  logGeneratedContent,
  compileTemplateFile,
  logFatalAndTerminate,
} from '../utils';
import {
  EMPTY_JOB_CONFIG,
  PREDEFINED_ARCHETYPES,
  TEMPLATE_FILE_EXTENSION,
  DEFAULT_TEMPLATE_INCLUDE_PATHS,
} from '../constants';

export const cgenCli = ({
  parameters = [],
  options = {},
  jobName = '',
}: CgenCliInput) => {
  const config: CgenConfig = getCgenConfig();

  if (!config) {
    logFatalAndTerminate(
      new Error(
        "Unable to locate cgen config.  Provide a cgen.config.json or add 'cgen' to your package.json."
      )
    );
  }

  const properties = parseCliParams(parameters);

  const cliOptions: CgenCliOptions = {
    failFast: !!options.failFast,
    overwrite: !!options.overwrite,
  };

  cgen(jobName, config, properties, cliOptions);
};

export const getCgenConfig = () => {
  try {
    return JSON.parse(shell.cat(shell.find('cgen.config.json')).toString());
  } catch (e) {
    try {
      const pkg = JSON.parse(shell.cat(shell.find('package.json')).toString());
      return pkg.cgen;
    } catch (e) {
      logFatalAndTerminate(e);
    }
  }
};

const parseCliParams = (parameters: Array<string>): LocalsObject => {
  try {
    return parameters.reduce((accum, param) => {
      const [key, value] = param.split(':');

      return {
        ...accum,
        [key]: value,
      };
    }, {});
  } catch (e) {
    logFatalAndTerminate(e);
  }
};

export const cgen = (
  jobName,
  config: CgenConfig = {},
  properties: LocalsObject = {},
  option: CgenCliOptions = {}
) => {
  const { base: baseJobConfig, ...jobs } = config;

  if (!jobs[jobName]) {
    logFatalAndTerminate(
      new Error('No jobs were provided.  Please provide a valid cgen job.')
    );
  }
  const resolvedJobConfig = mergeDefaultAndSpecifiedJobs(jobs[jobName], baseJobConfig);

  logCgenConfig(resolvedJobConfig);

  generateFiles(resolvedJobConfig, properties);
};

const resolveTemplateLocations = ({
  include = [],
  exclude = [],
  excludePaths = [],
  includePaths = DEFAULT_TEMPLATE_INCLUDE_PATHS as Array<string>,
}: TemplatesConfig) => {
  const included = resolvePaths(includePaths, exclude);
  const excluded = resolvePaths(excludePaths, include);

  return included
    .subtract(excluded)
    .toArray()
    .filter(pathName => TEMPLATE_FILE_EXTENSION === path.extname(pathName));
};

const mergeDefaultAndSpecifiedJobs = (
  jobConfig: JobConfig | ProjectArchetypeName = 'react-ts',
  baseJob: JobConfig = EMPTY_JOB_CONFIG
): JobConfig => {
  const archetype = PREDEFINED_ARCHETYPES[jobConfig as string];
  return archetype ? mergeDeep(baseJob, archetype) : mergeDeep(baseJob, jobConfig);
};

export const generateFiles = (jobConfig: JobConfig, properties?: LocalsObject) => {
  const { templates } = jobConfig;
  resolveTemplateLocations(templates).map(templatePath =>
    generateFileFromTemplate(templatePath, jobConfig, properties)
  );
};

const generateFileFromTemplate = (
  templatePath: string,
  jobConfig: JobConfig,
  properties: LocalsObject
): void => {
  const { fileNames, pugOptions, outPath = './src', defaultProperties = {} } = jobConfig;
  const mergedProperties = mergeDeep(defaultProperties, properties);
  const templateName = path.basename(templatePath, TEMPLATE_FILE_EXTENSION);

  if (!fileNames[templateName]) {
    logger.warn(
      `
      The fileNames configuration object does not define a fileName for template: %s.
      The template name will be used as a fallback.
    `,
      templateName
    );
  }

  const fileName = fileNames[templateName] || templateName;
  const fileOutputPath = resolveFilePath(outPath, fileName, mergedProperties);
  const fileExists = shell.test('-f', fileOutputPath);

  if (fileExists) {
    logger.info(
      'File %s already exists.  Skipping %s...',
      path.basename(fileOutputPath),
      path.basename(templatePath)
    );
  } else {
    const content = compileTemplateFile(templatePath, properties, pugOptions);
    logGeneratedContent(templatePath, content);
    writeFile(fileOutputPath, content);
  }
};
