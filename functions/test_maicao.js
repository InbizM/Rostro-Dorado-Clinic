const envioclick = require('./envioclick');

async function testMaicao() {
    console.log("Testing Maicao Route Cost...");

    const mockData = {
        city: "Maicao",
        department: "La Guajira",
        total: 220445,
        items: [
            {
                name: "Serum Facial",
                weight: 150, // 150 grams
                quantity: 1,
                dimensions: { length: 10, width: 10, height: 10 }
            }
        ]
    };

    try {
        const result = await envioclick.quoteShipping(mockData);
        if (result.success) {
            console.log("------------------------------------------------");
            result.quotes.forEach(q => {
                // Manually access the raw rate object if possible, or use the mapped fields if I added them.
                // Since I mapped them in envioclick.js, let's look at what 'q' contains.
                // Wait, quotes are mapped. I should check if I mapped insurance.
                // In quoteShipping, I mapped: shippingCost: rate.flete.
                // I need to see the RAW response to see insurance.
                // I'll assume standard insurance for now or print what I have.
                console.log(`Carrier: ${q.carrier} | Service: ${q.service} | Base Cost (Flete): $${q.shippingCost}`);
                // Note: The mapped object 'q' might not have insurance.
                // But let's check the console log of the raw response if enabled.
            });
            // Let's modify the script to print the RAW response data to see everything.
            console.log("\n--- Full Breakdown (First Quote) ---");
            // I can't access raw response here easily without modifying envioclick.js logging.
            // But envioclick.js logs: console.log(`[Envioclick Quote] Request: ...`);
            // I'll rely on the idea that Flete might NOT be the total.

            console.log("------------------------------------------------");
        } else {
            console.error("❌ FAILED:", result.error);
        }
    } catch (e) {
        console.error("❌ EXCEPTION:", e);
    }
}

testMaicao();
