import 'dotenv/config';
import Joi from 'joi';

interface EnvVars {
    PORT: number;
    GOOGLE_SHEET_ID: string;
    FOLDER_DRIVE_FOTOS: string;
    SUPABASE_URL: string;
    
}
const envSchema = Joi.object({
    PORT: Joi.number().required(),
  
    GOOGLE_SHEET_ID: Joi.string().required(),
    FOLDER_DRIVE_FOTOS: Joi.string().required(),
    SUPABASE_URL: Joi.string().uri().required(),
 
}).unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const env = {
    PORT: envVars.PORT,
    FOLDER_DRIVE_FOTOS: envVars.FOLDER_DRIVE_FOTOS,
    SUPABASE_URL: envVars.SUPABASE_URL.replace(/\/$/, ''),
    GOOGLE_SHEET_ID: envVars.GOOGLE_SHEET_ID,
};
