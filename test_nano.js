
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCfzEDfIjSredB9JtJ42zJR9yrgN_VEPRI";
const genAI = new GoogleGenerativeAI(API_KEY);

async function testNanoBanana() {
    try {
        console.log("Testing nano-banana-pro-preview...");
        const model = genAI.getGenerativeModel({ model: "nano-banana-pro-preview" });

        // Testing if it accepts multimodal prompts or generates images
        // Usually 'nano' implies a small text model, but let's blindly try requesting an image in the prompt
        // to see if it has hidden capabilities or if the user is right.

        // 1. Text Generation Test
        console.log("1. Text Generation Test...");
        const textResult = await model.generateContent("Hello, who are you?");
        console.log("Text response:", textResult.response.text());

        // 2. Image Generation Test (using generateContent requesting image data, unlikely but checking)
        console.log("2. Image Generation Test...");
        const imagePrompt = "Generate an image of a red apple";
        const imageResult = await model.generateContent(imagePrompt);
        const imgResponse = await imageResult.response;

        console.log("Image Prompt Response Parts:", JSON.stringify(imgResponse.candidates?.[0]?.content?.parts, null, 2));

    } catch (error) {
        console.error("Error testing Nano Banana:", error);
    }
}

testNanoBanana();
