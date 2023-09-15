import bcrypt from 'bcryptjs';

export const encryptPIN = (PIN: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    bcrypt.hash(PIN, 10, (err: Error, hash: string) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
};

export const isValidPIN = async (PIN: string, userPIN: string): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    bcrypt.compare(PIN, userPIN).then((match: boolean) => {
      if (!match) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};
