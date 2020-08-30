#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const { cgenCli } = require('@react-gen/cgen');
program.version('1.0.1');
program
    .command('cgen <jobName> <parameters...>')
    .option('-O, --overwrite', 'Overwrite file if it exists.')
    .option('-F, --fail-fast', 'Terminate process immediately on failure')
    .description('wow omg')
    .action((jobName, parameters, providedOptions) => {
    const options = {
        failfast: providedOptions['fail-fast'],
        overwrite: providedOptions.overwrite,
    };
    const cliInput = { parameters, jobName, options };
    console.log(cliInput);
    cgenCli(cliInput);
});
program.parse(process.argv);
