const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    console.log("Getting models list...");
    const models = await genAI.getGenerativeModel({ model: "gemini-pro" });
    // Try to get available models different way
    console.log("Testing with different model names...");
    
    const modelNames = [
      "gemini-pro",
      "gemini-1.5-flash", 
      "gemini-1.5-pro",
      "gemini-2.0-flash",
      "gemini-2.0-pro",
      "gemini-exp-1206"
    ];
    
    for (const name of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: name });
        const result = await model.generateContent("Say hello");
        console.log(`✅ Model ${name} works!`);
      } catch (e) {
        console.log(`❌ Model ${name}: ${e.message.split('\n')[0]}`);
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

listModels();
