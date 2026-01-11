import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // We can't easily list models with the basic SDK without extra setup, 
        // but let's try gemini-1.5-flash-latest again or gemini-pro.
        console.log("Using model: gemini-1.5-flash");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hi");
        console.log("SUCCESS:", result.response.text());
    } catch (e) {
        console.log("ERROR TYPE:", e.constructor.name);
        console.log("ERROR MESSAGE:", e.message);
    }
}
test();
