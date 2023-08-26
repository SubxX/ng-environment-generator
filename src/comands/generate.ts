import path from 'node:path';
import { Command } from 'commander'
import { environmentNameChecker, booleanChecker } from '../utils/validation.utils'
import {
    createEnvironmentFiles,
    getAngularConfiguration,
    updateConfigurationsForScripts
} from '../utils/helper.utils';
import { writeJSONFile } from '../utils/file.utils';
import ConfigBuilder from '../builder/config.builder';


const GenerateCommand = new Command('generate')
    .description('Generate a new environment')
    .argument('<string>', 'Name of the environment', environmentNameChecker)
    .option('--project <string>', 'Specify a project in which you want to add the environment configuration (default takes the first project)')
    .option('--script <boolean>', 'Add build script for this environment (default : true)', booleanChecker, true)
    .option('--e2e <boolean>', 'Add proper configuration for e2e as well (default : false)', booleanChecker, false)
    .action(async (envName, options) => {
        try {
            const { script, e2e, project } = options;

            // Getting angular config
            const ngConfig = await getAngularConfiguration();

            // Updating project configuration
            const newAngularConfig = new ConfigBuilder(ngConfig, envName)
                .initProjectName(project)
                .updateBUILDConfiguration()
                .updateSERVEConfiguration()
                .updateE2EConfiguration(e2e)
                // TODO Add tests and other configurations
                .build()


            const tasks = [
                createEnvironmentFiles(envName), // Creating environment files
                writeJSONFile(path.resolve(process.cwd(), 'angular.json'), newAngularConfig), // Writing back the updated ng configuration
            ]

            await Promise.all(tasks)

            // Finally Updating package json scripts
            if (script) {
                updateConfigurationsForScripts(envName)
            }

            console.log(`Setup for Environment ~ ${envName} successfully done.`);
            console.log('Thanks for using ng-env');
            process.exit(0)
        } catch (error: any) {
            console.error(error?.message ?? ' Something went wrong');
        }
    })

export default GenerateCommand;