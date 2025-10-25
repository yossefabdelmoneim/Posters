import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';
import {fileURLToPath} from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

cloudinary.config({connectionString: process.env.CLOUDINARY_URL,});

export default cloudinary;