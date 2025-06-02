import fs from 'fs'
import * as process from "node:process";
import * as path from "node:path";

const create_if_not_exists = (fp) => {
    if (!fs.existsSync(fp)) {
        fs.mkdirSync(fp, { recursive: true })
    }
}

const DIR_NAME = 'assets'

create_if_not_exists(path.resolve(process.cwd(), DIR_NAME))

export const read_file = (file_path: string): Buffer => {
    const fp = path.resolve(process.cwd(), DIR_NAME, file_path)
    return fs.readFileSync(fp)
}

export const write_file = (file_path: string, content: Buffer) => {
    const fp = path.resolve(process.cwd(), DIR_NAME, file_path)
    fs.writeFileSync(fp, content)
}

export const write_file_str = (file_path: string, content: string) => {
    const fp = path.resolve(process.cwd(), DIR_NAME, file_path)
    fs.writeFileSync(fp, content, 'utf8')
}
