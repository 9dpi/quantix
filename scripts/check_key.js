import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GEMINI_API_KEY || "";
console.log("Key Length:", key.length);
console.log("Key Starts With:", key.substring(0, 4));
console.log("Key Ends With:", key.substring(key.length - 4));
if (key.includes(" ")) console.log("WARNING: Key contains spaces!");
if (key.includes("\n")) console.log("WARNING: Key contains newlines!");
if (key.includes("\r")) console.log("WARNING: Key contains carriage returns!");
