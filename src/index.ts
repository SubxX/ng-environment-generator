#! /usr/bin/env node

import { cac } from 'cac'
import path from 'node:path';
import { ErrorMessages } from './constants/error-messages';
import { isEnvironmentNameValid, isOptionsBoolean } from './utils/validation.utils'
import {
  createEnvironmentFiles,
  formatOptions,
  getAngularConfiguration,
  updateConfigurationForBUILDCommand,
  updateConfigurationForE2ECommand,
  updateConfigurationForSERVECommand,
  updateScripts
} from './utils/helper.utils';
import { writeJSONFile } from './utils/file.helper';

const cli = cac('ng-env')

cli
  .version("1.0.0")
  .option("generate [value]", "Generate new environment")
  .parse(process.argv);

cli
  .command("generate [value]", "Generate new environment")
  .option('--project [value]', 'Specify a project in which you want to add the environment configuration (default takes the first project)')
  .option('--script [value]', 'Add build script for this environment (default : true)', { default: true })
  .option('--e2e [value]', 'Add proper configuration for e2e as well (default : false)', { default: false })
  .action(async (envName, options) => {
    try {
      const { script, e2e, project } = formatOptions(options)

      if (!isOptionsBoolean({ script, e2e }))
        throw new Error(ErrorMessages.INVALID_FLAG_VALUES)

      if (!isEnvironmentNameValid(envName))
        throw new Error(ErrorMessages.INVALID_ENVIRONMENT_NAME)

      // Getting angular config
      const config = await getAngularConfiguration();

      // Updating project configuration
      const projectName = project ?? Object.keys(config?.projects)[0] // defaults to first 1
      const projectConfig = config?.projects[projectName];
      if (!projectConfig) throw new Error(ErrorMessages.NO_PROJECT_CONFIG(projectName));

      updateConfigurationForBUILDCommand(projectConfig, envName)
      updateConfigurationForSERVECommand(projectConfig, envName, projectName)
      if (e2e) updateConfigurationForE2ECommand(projectConfig, envName, projectName)

      // Creating environment files
      await createEnvironmentFiles(envName);

      // Finally writing back the updated configuration
      await writeJSONFile(path.resolve(process.cwd(), 'angular.json'), config)

      // Updating package json scripts
      if (script) await updateScripts(envName, path.resolve(process.cwd(), `package.json`));

      console.log(`Setup for Environment ~ ${envName} successfully done.`);
      console.log('Thanks for using ng-env');
      process.exit(1)
    } catch (error: any) {
      console.error(error?.message ?? ' Something went wrong');
    }
  })

cli.on('command:*', () => {
  console.error('Invalid command: %s', cli.args.join(' '))
  cli.outputHelp()
  process.exit(1)
})


cli.help()
cli.parse()