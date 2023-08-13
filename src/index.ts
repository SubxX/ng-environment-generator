#! /usr/bin/env node

import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'child_process'
import { ErrorMessages } from './constants/error-messages';
import { validateEnvironmentName } from './utils/validation.utils'

const program = new Command()

program
    .version("1.0.0")
    .description("An CLI for creating new angular environment variables")
    .option("-l, --ls  [value]", "List directory contents")
    .option("-g, --generate <value>", "Generate new environment")
    .parse(process.argv);

const options = program.opts();

async function getAngularConfiguration() {
    await execSync('ng config');
    const ngConfig = await readFileSync(path.resolve(__dirname, 'angular.json'), 'utf8');
    return JSON.parse(ngConfig);
}

async function updateNgConfig(config: any, envName: string, project?: string) {
    const projectName = project ?? Object.keys(config?.projects)[0]
    const projectConfig = config?.projects[projectName]
    if (!projectConfig) throw new Error(`No project configuration found ~ ${projectName ?? 'N/A'}`);

    const build = projectConfig.architect.build
    const serve = projectConfig.architect.serve
    const e2e = projectConfig.architect.e2e

    if (build?.configurations && build?.configurations[envName])
        throw new Error(`Environment configuration exists for 'ng build' ~ ${envName}`)

    if (serve?.configurations && serve?.configurations[envName])
        throw new Error(`Environment configuration exists for 'ng serve' ~ ${envName}`)

    if (e2e && e2e?.configurations && e2e?.configurations[envName])
        throw new Error(`Environment configuration exists for 'ng e2e ${projectName}' ~ ${envName}`)

    // Build configuration
    build.configurations = {
        ...(build.configurations ?? {}),
        [envName]: {
            fileReplacements: [
                {
                    "replace": "src/environments/environment.ts",
                    "with": `src/environments/environment.${envName}.ts`
                }
            ]
        }
    }

    // Serve configuration
    serve.configurations = {
        ...(serve.configurations ?? {}),
        [envName]: {
            "browserTarget": `${projectName}:build:${envName}`
        }
    }

    // e2e configuration
    if (e2e) {
        e2e.configurations = {
            ...(e2e.configurations ?? {}),
            [envName]: {
                "devServerTarget": `${projectName}:serve:${envName}`
            }
        }
    }

    return config;
}

async function main(envName: string, project?: string) {
    try {
        // Validate envName it must me a normal string without ay special character
        if (validateEnvironmentName(envName)) throw new Error(ErrorMessages.INVALID_ENVIRONMENT_NAME)


        const config = await getAngularConfiguration()
        const updatedConfig = await updateNgConfig(config, envName, project)

        await writeFileSync(
            path.resolve(__dirname, 'newAngular.json'),
            JSON.stringify(updatedConfig, null, 2), 'utf8'
        )
    } catch (error: any) {
        console.log(error.message)
    }
}

if (options.generate) {
    main(options.generate)


    // generateEv(path.resolve(__dirname, options.generate));


    // inputs
    // 1. env name
    // 2. project (if not specified take the first 1)

    // Check if this is an angular project (ng config)

    // then check if the passed (option.generate) environment exists or not if exist then return from here else continue

    // create environment files
    // sub steps ~
    // Check if the default environment exists or not if not then create it first as environment.ts
    // Then create a [name].environment.ts file inside root/src/environment

    // update angular configuration file
    // sub steps ~
    // create an environment under project -> architect -> build -> configuration (with file replacement)
    // Future scope ~
    // Allow user to copy from an existing configuration
    // update serve configurations (add new environment)

    // Update E2E configuration if exists

    //  YAY its a success

}

if (!process.argv.slice(2).length) {
    program.outputHelp();
}