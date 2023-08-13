import { execSync } from "node:child_process";
import path from "node:path";
import { readFileSync } from "node:fs";

export async function getAngularConfiguration() {
    await execSync('ng config');
    const ngConfig = await readFileSync(path.resolve(__dirname, 'angular.json'), 'utf8');
    return JSON.parse(ngConfig);
}