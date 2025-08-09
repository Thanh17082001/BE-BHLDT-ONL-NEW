import { hashSync, compareSync } from 'bcrypt';

export class UserUtil {
    private static saltRounds: number = 10;

    public static hashPassword(password: string): string {
        let hashedPassword = hashSync(password, this.saltRounds);
        return hashedPassword;
    }

    public static comparePassword(password: string, hashedPassword: string): boolean {
        return compareSync(password, hashedPassword);
        return false;
    }

    public static generateRandomNumberID() {
        let ms = Math.floor(Math.random() * Date.now()).toString(10);
        return ms;
    }
    public static isValidPassword(password: string, hash: string) {
        return compareSync(password, hash);
    }
}