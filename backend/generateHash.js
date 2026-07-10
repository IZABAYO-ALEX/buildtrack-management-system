import bcrypt from "bcrypt";

const password = "buildtrack123";

const hash = await bcrypt.hash(password, 12);

console.log(hash);
