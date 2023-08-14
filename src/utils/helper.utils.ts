import { execSync } from "node:child_process";
import path from "node:path";
import { existsSync, writeFileSync } from "node:fs";
import { readJSONFile } from "./file.helper";

/**
 * @input options {[key]: value}
 * @purpose converts 'true' & 'false' to its appropriate boolean value true & false
 * @returns converted options
 */
export const formatOptions = (options: Record<string, any>) => {
    Object.keys(options).forEach(key => {
        if (options[key] === 'true') options[key] = true
        if (options[key] === 'false') options[key] = false
    })
    return options
}

export async function getAngularConfiguration() {
    await execSync('ng config');
    const ngConfig = await readJSONFile(path.resolve(process.cwd(), 'angular.json'));
    return ngConfig;
}

const getBrowserTarget = (projectName: string, envName: string) => `${projectName}:build:${envName}`

export const updateConfigurationForBUILDCommand = (config: any, envName: string) => {
    const build = config.architect.build;

    if (build?.configurations && build?.configurations[envName])
        throw new Error(`Environment configuration exists for 'ng build' ~ ${envName}`);

    // TODO : Handle for existing environments

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
}

export const updateConfigurationForSERVECommand = (config: any, envName: string, projectName: string) => {
    const serve = config.architect.serve;
    if (serve?.configurations && serve?.configurations[envName])
        throw new Error(`Environment configuration exists for 'ng serve' ~ ${envName}`)

    // Serve configuration
    serve.configurations = {
        ...(serve.configurations ?? {}),
        [envName]: {
            "browserTarget": getBrowserTarget(projectName, envName)
        }
    }
}

export const updateConfigurationForE2ECommand = (config: any, envName: string, projectName: string) => {
    const e2e = config.architect.e2e
    if (e2e && e2e?.configurations && e2e?.configurations[envName])
        throw new Error(`Environment configuration exists for 'ng e2e ${projectName}' ~ ${envName}`)

    // e2e configuration
    if (e2e) {
        e2e.configurations = {
            ...(e2e.configurations ?? {}),
            [envName]: {
                "devServerTarget": getBrowserTarget(projectName, envName)
            }
        }
    }
}

export const createEnvironmentFiles = async (envName: string) => {
    const content = `export const environment = {};`;
    const isExist = await existsSync(path.join(process.cwd(), `src/environments/environment.${envName}.ts`))
    const isDevEnvFileExist = await existsSync(path.join(process.cwd(), `src/environments/environment.ts`))

    if (isExist) throw new Error(`Environment file for '${envName}' already exists`);

    const promises = [
        writeFileSync(path.join(process.cwd(), `src/environments/environment.${envName}.ts`), content, 'utf-8')
    ]
    if (!isDevEnvFileExist) {
        promises.unshift(writeFileSync(path.join(process.cwd(), `src/environments/environment.ts`), content, 'utf-8'))
    }
    await Promise.allSettled(promises)
    return true
}