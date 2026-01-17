
const API_KEY = "AIzaSyCe1FWHh9mji0Z6KHruqAduTcd9u_Suv-g";

async function testImagen4Fast() {
    try {
        console.log("Testing imagen-4.0-fast-generate-001 via REST predict...");

        // The endpoint often follows pattern: https://generativelanguage.googleapis.com/v1beta/models/{model}:predict
        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${API_KEY}`;

        // Payload structure for Imagen models on Vertex/GenAI usually expects 'instances' with 'prompt'
        const requestBody = {
            instances: [
                { prompt: "A golden lotus flower, minimalistic, high quality" }
            ],
            parameters: {
                sampleCount: 1,
                // aspectRatio: "1:1" // Optional
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
        }

        const data = await response.json();
        console.log("Response received!");

        if (data.predictions && data.predictions[0]) {
            if (data.predictions[0].bytesBase64Encoded) {
                console.log("SUCCESS: Base64 Image received!");
            } else if (data.predictions[0].mimeType && data.predictions[0].bytesBase64Encoded) {
                console.log("SUCCESS: Base64 Image with mimetype received!");
            } else {
                console.log("Prediction received but format is unique:", Object.keys(data.predictions[0]));
            }
        } else {
            console.log("No predictions found.", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Error testing Imagen 4 Fast:", error);
    }
}

testImagen4Fast();
