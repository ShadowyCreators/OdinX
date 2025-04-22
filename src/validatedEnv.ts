import { z } from 'zod';

const schema = z.object({
  VITE_BACKEND_URL: z.string(),
  VITE_BITCOIN_EXPLORER_URL: z.string(),
  VITE_ETHEREUM_EXPLORER_URL: z.string(),
});

const validatedENV = schema.parse(import.meta.env);

console.log(validatedENV);

export { validatedENV };
