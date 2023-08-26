import { writeFile } from "node:fs";
import { promisify } from "node:util";

const writeFileAsync = promisify(writeFile);

export const writeJSONFile = async (filePath: string, data: Record<string, any>) => {
    return await writeFileAsync(filePath, JSON.stringify(data, null, 2))
}