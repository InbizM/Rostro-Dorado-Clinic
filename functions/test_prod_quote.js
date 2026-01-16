const envioclick = require('./envioclick');

async function testQuote() {
    console.log("Testing Envioclick Quote (Production)...");

    // Mock Data mimicking the failing order (150g Serum)
    const mockData = {
        city: "Bogotá",
        department: "Cundinamarca",
        total: 50000,
        items: [
            {
                name: "Serum Facial",
                weight: 150, // 150 grams
                quantity: 1,
                dimensions: { length: 10, width: 10, height: 10 }
            }
        ]
    };

    console.log(`Input Item Weight: ${mockData.items[0].weight} (raw)`);

    try {
        const result = await envioclick.quoteShipping(mockData);
        if (result.success) {
            console.log("\n✅ SUCCESS: Quotes received.");
            console.log("------------------------------------------------");
            result.quotes.forEach(q => {
                console.log(`Carrier: ${q.carrier} | Service: ${q.service} | Cost: $${q.shippingCost} COP | ID: ${q.idRate}`);
            });
            console.log("------------------------------------------------");

            // Validation
            const firstQuote = result.quotes[0];
            if (firstQuote.shippingCost > 50000) {
                console.error("⚠️ WARNING: Cost seems abnormally high. Weight conversion might technically fail or Carrier is expensive.");
            } else {
                console.log("✅ Cost seems reasonable (< $50,000 COP). Weight conversion likely worked.");
            }

        } else {
            console.error("\n❌ FAILED:", result.error);
        }
    } catch (e) {
        console.error("\n❌ EXCEPTION:", e);
    }
}

testQuote();
