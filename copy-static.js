var fs = require('fs-extra');

fs.copySync(`${process.cwd()}/assets`, `${process.cwd()}/build/assets`, { overwrite: true });
fs.copySync(`${process.cwd()}/index.html`, `${process.cwd()}/build/index.html`, { overwrite: true });
fs.copySync(`${process.cwd()}/index.css`, `${process.cwd()}/build/index.css`, { overwrite: true });