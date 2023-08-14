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
    const env = build.configurations[envName];

    const pattern = new RegExp(`.*${envName}.*`);
    const isExist = env?.fileReplacements?.some((r: any) => r?.replace?.match(pattern) || r?.with?.match(pattern))


    if (env && isExist)
        throw new Error(`Environment configuration exists for 'build' ~ ${envName}`);

    // File replacements array
    const fileReplacements = [
        ...(env?.fileReplacements ?? []),
        {
            "replace": "src/environments/environment.ts",
            "with": `src/environments/environment.${envName}.ts`
        }
    ]

    // Build configuration
    build.configurations[envName] = {
        ...(env ?? {}),
        fileReplacements
    }
}

export const updateConfigurationForSERVECommand = (config: any, envName: string, projectName: string) => {
    const serve = config.architect.serve;
    if (serve?.configurations && serve?.configurations[envName]) {
        console.log(`Environment - '${envName}' configuration exists for 'serve' ~ SKIPPING...`)
        return
    }

    // Serve configuration
    serve.configurations = {
        ...(serve.configurations ?? {}),
        [envName]: {
            "browserTarget": getBrowserTarget(projectName, envName)
        }
    }
}

export const updateConfigurationForE2ECommand = (config: any, envName: string, projectName: string) => {
    const e2e = config?.architect?.e2e

    if (e2e?.configurations && e2e?.configurations[envName]) {
        console.log(`Environment - '${envName}' Configuration exists for 'e2e' SIPPING...`);
        return;
    }

    // e2e configuration
    e2e.configurations = {
        ...(e2e.configurations ?? {}),
        [envName]: {
            "devServerTarget": getBrowserTarget(projectName, envName)
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