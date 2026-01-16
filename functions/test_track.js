const envioclick = require('./envioclick');

// Mock Firebase Config if needed (or rely on dotenv if set up, but envioclick.js reads process.env)
// We might need to manually set the API key if it's not in the environment where this script runs.
// checking envioclick.js... it uses functions.config().envioclick.api_key OR '...' 
// It seems it has a default/fallback or expects functions config.
// Let's rely on the hardcoded key I saw earlier in envioclick.js if it exists, or fails.
// I saw "const API_KEY = "6118c7fb-4b7d-4be9-92ce-503c55f40444";" in previous turns.

async function run() {
    try {
        console.log("Tracking 84151486471...");
        // mocking what trackShipment does but inspecting full response
        // actually trackShipment is exported.
        const result = await envioclick.trackShipment('84151486471');
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(e);
    }
}

run();
