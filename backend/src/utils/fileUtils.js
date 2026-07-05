import fs from 'fs';
export const FILE_CONSTANTS = {
  O_RDONLY: fs.constants.O_RDONLY || 0,
  O_WRONLY: fs.constants.O_WRONLY || 1,
  O_RDWR: fs.constants.O_RDWR || 2,
  O_CREAT: fs.constants.O_CREAT || 64,
  O_EXCL: fs.constants.O_EXCL || 128,
  O_TRUNC: fs.constants.O_TRUNC || 512,
  O_APPEND: fs.constants.O_APPEND || 1024,
  S_IRUSR: fs.constants.S_IRUSR || 256,
  S_IWUSR: fs.constants.S_IWUSR || 128,
  S_IXUSR: fs.constants.S_IXUSR || 64,
};
export default { FILE_CONSTANTS };
