export default class ConfigBuilder {
    private ngConfig!: Record<string, any>;
    private projectName!: string;
    private envName!: string;

    constructor(config: any, envName: string) {
        this.ngConfig = config;
        this.envName = envName;
    }

    initProjectName(project?: string) {
        const pName = project ?? Object.keys(this.ngConfig?.projects)[0] // defaults to first 1
        if (!this.ngConfig?.projects?.hasOwnProperty(pName)) throw new Error(`No project configuration found for "${pName ?? 'N/A'}"`);
        this.projectName = pName;
        return this;
    }

    private get config() {
        return this.ngConfig?.projects[this.projectName]
    }

    updateBUILDConfiguration() {
        const build = this.config?.architect?.build;
        if (!build || !build?.configurations) {
            throw new Error(`No Build configuration found for this project it must exist!`);
        }

        const env = build.configurations[this.envName];
        const pattern = new RegExp(`.*${this.envName}.*`);
        const isExist = env?.fileReplacements?.some((r: any) => r?.replace?.match(pattern) || r?.with?.match(pattern))

        if (env && isExist)
            throw new Error(`Environment configuration exists for 'build' ~ ${this.envName}`);

        // Extending fileReplacements array
        const fileReplacements = [
            ...(env?.fileReplacements ?? []),
            {
                "replace": "src/environments/environment.ts",
                "with": `src/environments/environment.${this.envName}.ts`
            }
        ]

        // Build configuration
        build.configurations[this.envName] = {
            ...(env ?? {}),
            fileReplacements
        }
        return this;
    }

    updateSERVEConfiguration() {
        const serve = this.config?.architect?.serve;
        if (!serve || !serve?.configurations)
            throw new Error(`No Serve configuration found for this project it must exist!`);

        if (serve?.configurations[this.envName]) {
            console.log(`Environment - '${this.envName}' configuration exists for 'serve' ~ SKIPPING...`)
            return this
        }

        // Serve configuration
        serve.configurations = {
            ...(serve?.configurations ?? {}),
            [this.envName]: {
                "browserTarget": `${this.projectName}:build:${this.envName}`
            }
        }
        return this
    }

    updateE2EConfiguration(enabled?: boolean) {
        if (enabled) {
            const e2e = this.config?.architect?.e2e
            if (!e2e || !e2e?.configurations) {
                console.log(`No E2E configuration found for this project! SKIPPING...`)
                return this
            }
            if (e2e?.configurations[this.envName]) {
                console.log(`Environment - '${this.envName}' Configuration exists for 'e2e' SIPPING...`);
                return this;
            }

            // e2e configuration
            e2e.configurations = {
                ...(e2e?.configurations ?? {}),
                [this.envName]: {
                    "devServerTarget": `${this.projectName}:serve:${this.envName}`
                }
            }
        }
        return this;
    }

    build() {
        return this.ngConfig;
    }
}