import { writeFileSync, readFileSync } from "node:fs";

export const writeJSONFile = async (filePath: string, data: Record<string, any>) => {
    return await writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
}

export const readJSONFile = async (filePath: string) => {
    const jsonData = await readFileSync(filePath, 'utf8');
    return JSON.parse(jsonData)
}