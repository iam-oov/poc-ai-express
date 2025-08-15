require('dotenv').config();
const Joi = require('joi');

// Environment variables validation schema
const envSchema = Joi.object({
  GEMINI_API_KEY: Joi.string().required().messages({
    'any.required': 'GEMINI_API_KEY is required',
    'string.empty': 'GEMINI_API_KEY cannot be empty',
  }),

  PINECONE_API_KEY: Joi.string().required().messages({
    'any.required': 'PINECONE_API_KEY is required',
    'string.empty': 'PINECONE_API_KEY cannot be empty',
  }),

  PINECONE_INDEX_NAME: Joi.string().required().messages({
    'any.required': 'PINECONE_INDEX_NAME is required',
    'string.empty': 'PINECONE_INDEX_NAME cannot be empty',
  }),

  // Notion configuration (optional)
  NOTION_API_KEY: Joi.string().optional().messages({
    'string.empty': 'NOTION_API_KEY cannot be empty if provided',
  }),

  PORT: Joi.number().integer().min(1000).max(65535).default(3000).messages({
    'number.base': 'PORT must be a number',
    'number.integer': 'PORT must be an integer',
    'number.min': 'PORT must be greater than or equal to 1000',
    'number.max': 'PORT must be less than or equal to 65535',
  }),

  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
}).unknown(); // Allow other environment variables that are not defined

/**
 * Validates and loads environment variables
 * @returns {Object} Object with validated environment variables
 * @throws {Error} If validation fails
 */
function loadEnvironment() {
  const { error, value } = envSchema.validate(process.env);

  if (error) {
    const errorMessages = error.details
      .map((detail) => detail.message)
      .join(', ');
    throw new Error(
      `Environment variables configuration error: ${errorMessages}`
    );
  }

  return {
    geminiApiKey: value.GEMINI_API_KEY,
    pineconeApiKey: value.PINECONE_API_KEY,
    pineconeIndexName: value.PINECONE_INDEX_NAME,
    notionApiKey: value.NOTION_API_KEY,
    port: value.PORT,
    nodeEnv: value.NODE_ENV,
  };
}

/**
 * Function that checks configuration and terminates the application if there are errors
 */
function validateEnvironmentOrExit() {
  try {
    console.log('🔍 Validating environment variables configuration...');
    const config = loadEnvironment();
    console.log('✅ Environment variables configuration is valid');
    console.log(`📍 Environment: ${config.nodeEnv}`);
    console.log(`🚪 Configured port: ${config.port}`);
    return config;
  } catch (error) {
    console.error('❌ Configuration error:', error.message);
    console.error(
      '💡 Make sure you have a .env file with the required variables.'
    );
    console.error('📝 You can use .env.example as a reference.');
    process.exit(1);
  }
}

module.exports = {
  loadEnvironment,
  validateEnvironmentOrExit,
};
