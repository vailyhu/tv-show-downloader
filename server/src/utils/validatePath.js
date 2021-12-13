import fs from 'fs';

export const validatePath = (path) => {
    if (fs.existsSync(path)) {
        try {
            const stat = fs.statSync(path);
            if (!stat.isDirectory()) {
                return 'The given item is a file, not directory';
            }
        } catch (e) {
            return 'Unknown error';
        }
        try {
            fs.accessSync(path, fs.constants.W_OK);
        } catch (e) {
            return 'Directory exists, but it is read-only';
        }
    } else {
        try {
            fs.mkdirSync(path, {recursive: true});
        } catch (e) {
            return 'Permission denied while trying to create the directory';
        }
    }
    return true;
};
