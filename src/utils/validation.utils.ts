export const isEnvironmentNameValid = (name: string) => {
    if (!name) return false
    const regexExp = new RegExp(/[^a-zA-Z0-9-_]/g)
    return !name.match(regexExp)
}

export const isOptionsBoolean = (options: Record<string, any> = {}) => {
    return !Object.keys(options).some(key => typeof options[key] !== 'boolean')
}