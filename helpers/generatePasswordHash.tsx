import { hash } from "bcryptjs";

export async function generatePasswordHash(password: string) {
  const saltRounds = 12;
  const passwordHash = await hash(password, saltRounds);
  return passwordHash;
}
