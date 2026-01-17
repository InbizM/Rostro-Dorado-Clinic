
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCe1FWHh9mji0Z6KHruqAduTcd9u_Suv-g";
const genAI = new GoogleGenerativeAI(API_KEY);

async function testGeminiImage() {
    try {
        console.log("Testing gemini-2.0-flash-exp-image-generation...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp-image-generation" });

        const prompt = "Generate an image of a golden futuristic medical tool on a dark background.";

        // Standard generateContent call
        const result = await model.generateContent(prompt);
        const response = await result.response;

        console.log("Response parts:", JSON.stringify(response.candidates?.[0]?.content?.parts, null, 2));

        // Check if parts contain inlineData (image)
        if (response.candidates?.[0]?.content?.parts?.some(p => p.inlineData)) {
            console.log("SUCCESS: Image data received!");
        } else {
            console.log("No image data found in response.");
            console.log("Full text:", response.text());
        }

    } catch (error) {
        console.error("Error testing:", error);
    }
}

testGeminiImage();
