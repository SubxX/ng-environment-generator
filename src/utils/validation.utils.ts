export const validateEnvironmentName = (name: string) => {
    const regexExp = new RegExp(/[^a-zA-Z0-9-_]/g)
    return name.match(regexExp)
}