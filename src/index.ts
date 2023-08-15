#! /usr/bin/env node

import path from 'node:path';
import { program } from 'commander'
import { environmentNameChecker, booleanChecker } from './utils/validation.utils'
import {
  createEnvironmentFiles,
  formatOptions,
  getAngularConfiguration,
  getPackageDotJson,
  updateConfigurationForBUILDCommand,
  updateConfigurationForE2ECommand,
  updateConfigurationForSERVECommand,
  updateConfigurationsForScripts
} from './utils/helper.utils';
import { writeJSONFile } from './utils/file.helper';

program
  .name('ng-env')
  .description('A simple package to generate new angular environment')
  .version("1.0.0")
  .usage("[command] [options]")
  .configureHelp({
    sortSubcommands: true,
    subcommandTerm: (cmd) => cmd.name()
  });

program
  .command('generate')
  .description('Generate a new environment')
  .argument('<string>', 'Name of the environment', environmentNameChecker)
  .option('--project <string>', 'Specify a project in which you want to add the environment configuration (default takes the first project)')
  .option('--script <boolean>', 'Add build script for this environment (default : true)', booleanChecker, true)
  .option('--e2e <boolean>', 'Add proper configuration for e2e as well (default : false)', booleanChecker, false)
  .action(async (envName, options) => {
    try {
      const { script, e2e, project } = formatOptions(options)

      // Getting angular config
      const ngConfig = await getAngularConfiguration();
      const packageJsoConfig = await getPackageDotJson()

      // Updating project configuration
      const projectName = project ?? Object.keys(ngConfig?.projects)[0] // defaults to first 1
      const projectConfig = ngConfig?.projects[projectName];
      if (!projectConfig) throw new Error(`No project configuration found ~ ${projectName ?? 'N/A'}`);

      updateConfigurationForBUILDCommand(projectConfig, envName)
      updateConfigurationForSERVECommand(projectConfig, envName, projectName)
      if (e2e) updateConfigurationForE2ECommand(projectConfig, envName, projectName)
      // TODO Add tests and other configurations

      const tasks = [
        createEnvironmentFiles(envName), // Creating environment files
        writeJSONFile(path.resolve(process.cwd(), 'angular.json'), ngConfig), // Writing back the updated ng configuration
      ]

      // Updating package json scripts
      if (script) {
        updateConfigurationsForScripts(envName, packageJsoConfig);
        tasks.push(writeJSONFile(path.resolve(process.cwd(), 'package.json'), packageJsoConfig))
      }

      await Promise.all(tasks)

      console.log(`Setup for Environment ~ ${envName} successfully done.`);
      console.log('Thanks for using ng-env');
      process.exit(1)
    } catch (error: any) {
      console.error(error?.message ?? ' Something went wrong');
    }
  })

program.showHelpAfterError('add --help for additional information)');
program.parse()