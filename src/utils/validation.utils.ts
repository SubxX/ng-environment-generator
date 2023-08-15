import { InvalidArgumentError } from 'commander'

export const environmentNameChecker = (name: string) => {
    const regexExp = new RegExp(/[^a-zA-Z0-9-_]/g)
    if (!name.match(regexExp)) return name;
    throw new InvalidArgumentError('Invalid environment name provided please provide a proper name eg (testing, staging, internal)');
}

export const booleanChecker = (val: any) => {
    if (typeof val === 'boolean') return val
    if (val === 'true' || val === 'false') return val === 'true'
    throw new InvalidArgumentError('Not a boolean.');
}