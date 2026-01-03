import bcrypt from 'bcrypt';

export class PasswordHasher{
    private readonly salt_Rounds = 12;

    async hash(password:string): Promise<string>{
        return await bcrypt.hash(password, this.salt_Rounds);
    }

    async verify(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    /*
        Maybe add password needs rehash in future , in case we change hashing algorithm.
        This function will be used to check if a user still uses old hashed password on login,
        If so rehash password with new algorithm,
        else just keep password
    */


}

export const passwordHasher = new PasswordHasher();
