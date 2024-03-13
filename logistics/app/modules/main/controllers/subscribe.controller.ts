import logger from '../../../lib/logger';
import crypto from 'crypto'
import { Request, Response, NextFunction } from 'express';

const PRIVATE_KEY_1 =
  'MC4CAQAwBQYDK2VuBCIEIIDHp6Iw8/qWKStVjhwavZrVFWrGbm9iseTGPX8wJndR';
const PUBLIC_KEY_1 =
  'MCowBQYDK2VuAyEAduMuZgmtpjdCuxv+Nc49K0cB6tL/Dj3HZetvVN7ZekM=';


// Pre-defined public and private keys
const privateKey = crypto.createPrivateKey({
    key: Buffer.from(PRIVATE_KEY_1, 'base64'), // Decode private key from base64
    format: 'der', // Specify the key format as DER
    type: 'pkcs8', // Specify the key type as PKCS#8
  });
  const publicKey = crypto.createPublicKey({
    key: Buffer.from(PUBLIC_KEY_1, 'base64'), // Decode public key from base64
    format: 'der', // Specify the key format as DER
    type: 'spki', // Specify the key type as SubjectPublicKeyInfo (SPKI)
  });
  

const sharedKey = crypto.diffieHellman({
    privateKey: privateKey,
    publicKey:publicKey ,
  });

  // Decrypt using AES-256-ECB
function decryptAES256ECB(key: any, encrypted: any) {
    const iv = Buffer.alloc(0); // ECB doesn't use IV
    const decipher = crypto.createDecipheriv('aes-256-ecb', key, iv);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

class SubscribeController {
  async onSubscribe(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
        const { challenge } = req.body; // Extract the 'challenge' property from the request body
        console.log({challenge})
        const answer = decryptAES256ECB(sharedKey, challenge); // Decrypt the challenge using AES-256-ECB
        const resp = { answer: answer };
        res.status(200).json(resp); // Send a JSON response with the answer
    } catch (error: any) {
      logger.error(`${req.method} ${req.originalUrl} error: ${error.message}`);
      next(error);
    }
  }

}
export default SubscribeController;
