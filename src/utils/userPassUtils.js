import bcrypt from 'bcrypt';

const salt = bcrypt.genSaltSync(10);

export const hashPassword = password => bcrypt.hashSync(password, salt);
export const encryptPassword = (user, password) => bcrypt.compareSync(password, user.password);
