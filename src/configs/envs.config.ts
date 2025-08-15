import * as joi from 'joi';
import { config } from 'dotenv';

export const DEVELOPMENT = 'development';
export const PRODUCTION = 'production';

const { NODE_ENV = DEVELOPMENT } = process.env;

// Load the appropriate .env file based on the environment
if (NODE_ENV === PRODUCTION) {
  config({ path: '.env.prod' });
} else {
  config({ path: '.env' });
}

interface IEnvVars {
  NODE_ENV: string;
  PORT: number;
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  GEMINI_MODEL_EMBEDDINGS: string;
  PINECONE_API_KEY: string;
  PINECONE_INDEX_NAME: string;
  NOTION_API_KEY: string;
}

const envVarsSchema = joi
  .object({
    NODE_ENV: joi.string().valid(DEVELOPMENT, PRODUCTION).default(DEVELOPMENT),
    PORT: joi.number().required(),
    GEMINI_API_KEY: joi.string().required(),
    GEMINI_MODEL: joi.string().required(),
    GEMINI_MODEL_EMBEDDINGS: joi.string().required(),
    PINECONE_API_KEY: joi.string().required(),
    PINECONE_INDEX_NAME: joi.string().required(),
    NOTION_API_KEY: joi.string().required(),
  })
  .unknown(true);

// validate environment variables
const { error, value } = envVarsSchema.validate({
  ...process.env,
});

if (error) {
  throw new Error(
    `[ENV: ${NODE_ENV}] Config validation error: ${error.message},`,
  );
}

const envVars: IEnvVars = value;

export const envs = {
  port: envVars.PORT,
  nodeEnv: envVars.NODE_ENV,
  geminiApiKey: envVars.GEMINI_API_KEY,
  geminiModel: envVars.GEMINI_MODEL,
  geminiModelEmbeddings: envVars.GEMINI_MODEL_EMBEDDINGS,
  pineconeApiKey: envVars.PINECONE_API_KEY,
  pineconeIndexName: envVars.PINECONE_INDEX_NAME,
  notionApiKey: envVars.NOTION_API_KEY,
};
