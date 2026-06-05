import { Client } from "@gradio/client";
import fs from 'fs';

async function testFullFlow() {
  try {
    console.log("Connecting to TripoSR...");
    const client = await Client.connect("stabilityai/TripoSR");
    console.log("Connected!");

    console.log("Fetching test image...");
    const imageRes = await fetch("https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png");
    const imageBlob = await imageRes.blob();

    console.log("Preprocessing image...");
    const preprocessResult = await client.predict("/preprocess", [
      imageBlob,
      true,
      0.85
    ]);
    
    console.log("Preprocess result:", JSON.stringify(preprocessResult.data, null, 2));
    const processedImage = preprocessResult.data[0];

    // Wait 2 seconds just in case
    await new Promise(r => setTimeout(r, 2000));

    console.log("Generating 3D...");
    const generateResult = await client.predict("/generate", [
      processedImage,
      32 // low res for fast test
    ]);

    console.log("Generate result:", JSON.stringify(generateResult.data, null, 2));

  } catch (err) {
    console.error("Test Failed:", err);
  }
}

testFullFlow();
