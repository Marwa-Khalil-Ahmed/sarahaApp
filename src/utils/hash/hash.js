import * as bcrypt from "bcrypt"

export const generateHash = ({ plaintext = "", salt = parseInt(process.env.SALT_ROUND) } = {}) => {
    const hash = bcrypt.hashSync(plaintext, salt);
    return hash;
}

export const compareHash = ({ plaintext = "", hashValue = "" } = {}) => {
    const match = bcrypt.compareSync(plaintext, hashValue);
    return match;
}