import path from "node:path";
import { existsSync, writeFileSync } from "node:fs";
import { readJSONFile, writeJSONFile } from "./file.utils";

export async function getAngularConfiguration() {
    try {
        const ngConfig = await readJSONFile(path.resolve(process.cwd(), 'angular.json'));
        return ngConfig;
    } catch (error: any) {
        const msg = error?.code === 'ENOENT' ?
            "No angular configuration found are you sure its an angular project/workspace ?" :
            error?.message
        throw new Error(msg)
    }
}

export async function getPackageDotJson() {
    try {
        const packageJson = await readJSONFile(path.resolve(process.cwd(), 'package.json'));
        return packageJson;
    } catch (error: any) {
        const msg = error?.code === 'ENOENT' ? "Unable to find package.json" : error?.message
        throw new Error(msg)
    }
}

export const updateConfigurationForBUILDCommand = (config: any, envName: string) => {
    const build = config.architect.build;
    if (!build || !build?.configurations) {
        throw new Error(`No Build configuration found for this project it must exist!`);
    }

    const env = build.configurations[envName];
    const pattern = new RegExp(`.*${envName}.*`);
    const isExist = env?.fileReplacements?.some((r: any) => r?.replace?.match(pattern) || r?.with?.match(pattern))

    if (env && isExist)
        throw new Error(`Environment configuration exists for 'build' ~ ${envName}`);

    // Extending fileReplacements array
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
    const serve = config?.architect?.serve;
    if (!serve || !serve?.configurations)
        throw new Error(`No Serve configuration found for this project it must exist!`);

    if (serve?.configurations[envName]) {
        console.log(`Environment - '${envName}' configuration exists for 'serve' ~ SKIPPING...`)
        return
    }

    // Serve configuration
    serve.configurations = {
        ...(serve?.configurations ?? {}),
        [envName]: {
            "browserTarget": `${projectName}:build:${envName}`
        }
    }
}

export const updateConfigurationForE2ECommand = (config: any, envName: string, projectName: string) => {
    const e2e = config?.architect?.e2e
    if (!e2e || !e2e?.configurations) {
        console.log(`No E2E configuration found for this project! SKIPPING...`)
        return
    }
    if (e2e?.configurations[envName]) {
        console.log(`Environment - '${envName}' Configuration exists for 'e2e' SIPPING...`);
        return;
    }

    // e2e configuration
    e2e.configurations = {
        ...(e2e?.configurations ?? {}),
        [envName]: {
            "devServerTarget": `${projectName}:serve:${envName}`
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

export const updateConfigurationsForScripts = (envName: string, packageJson: Record<string, any>) => {
    const scripts = packageJson?.scripts ?? {};

    const buildCommand = `build:${envName}`;
    const serveCommand = `serve:${envName}`;

    // Updating build command
    if (scripts[buildCommand]) {
        console.log(`Build command exist for environment ${envName} SKIPPING...`)
    } else {
        scripts[buildCommand] = `ng build --configuration=${envName}`
    }
    // Updating serve command
    if (scripts[serveCommand]) {
        console.log(`Serve command exist for environment ${envName} SKIPPING...`)
    } else {
        scripts[serveCommand] = `ng serve --configuration=${envName}`
    }
    packageJson['scripts'] = scripts
}