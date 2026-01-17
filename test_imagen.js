
import { GoogleGenerativeAI } from "@google/generative-ai";

// API Key from AiAssistant.tsx
const API_KEY = "AIzaSyCe1FWHh9mji0Z6KHruqAduTcd9u_Suv-g";
const genAI = new GoogleGenerativeAI(API_KEY);

async function testImageGen() {
    try {
        console.log("Testing Imagen 3...");
        // Note: The SDK might not have a direct helper for 'imagen-3.0-generate-001' yet 
        // depending on the exact version behavior, but let's try getting the model.
        const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });

        // Check if generateImages exists on the model object (it might be different than generateContent)
        // If not, we might need to use a raw fetch or different method.
        console.log("Model object created.");

        // This is a speculative call based on recent API patterns
        // Often it is model.generateImages in python, let's see if JS SDK has it.
        // If this fails, we'll try a raw fetch to the REST endpoint.

        // @ts-ignore
        if (model.generateImages) {
            // @ts-ignore
            const result = await model.generateImages({
                prompt: "A futuristic medical clinic with gold accents, photorealistic, 8k",
                number_of_images: 1
            });
            console.log("Success via SDK method!");
            console.log(result);
        } else {
            console.log("SDK method 'generateImages' not found. Testing Raw REST API...");

            const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${API_KEY}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    instances: [
                        { prompt: "A futuristic medical clinic with gold accents, photorealistic, 8k" }
                    ],
                    parameters: {
                        sampleCount: 1
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
            }

            const data = await response.json();
            console.log("Success via REST!");
            // console.log(JSON.stringify(data, null, 2));
            if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
                console.log("Image Base64 received!");
            } else {
                console.log("Response structure unexpected:", Object.keys(data));
            }
        }

    } catch (error) {
        console.error("Error testing image gen:", error);
    }
}

testImageGen();
