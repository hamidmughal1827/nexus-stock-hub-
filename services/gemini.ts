
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Supplier, Transaction } from "../types";

export const getInventoryInsights = async (
  products: Product[],
  transactions: Transaction[],
  suppliers: Supplier[]
) => {
  // Use process.env.API_KEY directly to initialize GoogleGenAI
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const inventoryContext = products.map(p => ({
    name: p.name,
    sku: p.sku,
    stock: p.quantity,
    reorderLevel: p.reorderLevel,
    expiry: p.expiryDate,
    price: p.price
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this inventory data and provide business insights: ${JSON.stringify(inventoryContext)}. 
    Identify: 
    1. Items at risk of stockout.
    2. Items that are slow-moving.
    3. Suggestions for batch orders.
    Return the response as a clear, professional summary with actionable bullet points.`,
    config: {
      temperature: 0.7,
    },
  });

  return response.text;
};
