export const ErrorMessages = {
    INVALID_ENVIRONMENT_NAME: 'Invalid environment name provided please provide a proper name eg (testing, staging, internal)',
    INVALID_FLAG_VALUES: 'Invalid type --script & --e2e takes boolean only!',
    NO_PROJECT_CONFIG: (name: string) => `No project configuration found ~ ${name ?? 'N/A'}`,
    ENV_FILE_EXIST: (name: string) => `Environment file for '${name}' already exists`
}