import path from "node:path";
import { existsSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const execSyncToJSON = (command: string) => {
    const bufferString = execSync(command, { encoding: 'utf8' });
    return JSON.parse(bufferString);
}

export async function getAngularConfiguration() {
    try {
        const ngConfig = execSyncToJSON('ng config');
        return ngConfig;
    } catch (error: any) {
        throw new Error("Failed to get angular configuration are you sure its an angular project/workspace ?")
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
    await Promise.all(promises)
    return true
}

export const updateConfigurationsForScripts = async (envName: string) => {
    const scriptCommandCheckerPrefix = (script: string) => `npm pkg get scripts.${script}`
    const scriptCommandAddPrefix = (script: string, value: string) => `npm pkg set scripts.${script}=${value}`
    const hasScript = (output: any) => typeof output === 'string'

    let executableScript = [];
    const buildCommand = `build:${envName}`;
    const serveCommand = `serve:${envName}`;

    const buildScript = execSyncToJSON(scriptCommandCheckerPrefix(buildCommand));
    const hasBuildScript = hasScript(buildScript)

    const serveScript = execSyncToJSON(scriptCommandCheckerPrefix(buildCommand));
    const hasServeScript = hasScript(serveScript)

    if (hasBuildScript) {
        console.log(`Build command exist for environment ${envName} SKIPPING...`)
    } else {
        executableScript.push(scriptCommandAddPrefix(buildCommand, `"ng build --configuration=${envName}"`))
    }

    if (hasServeScript) {
        console.log(`Serve command exist for environment ${envName} SKIPPING...`)
    } else {
        executableScript.push(scriptCommandAddPrefix(serveCommand, `"ng serve --configuration=${envName}"`))
    }

    const joinedCommand = executableScript.join('&&');
    if (joinedCommand) execSync(joinedCommand)
}