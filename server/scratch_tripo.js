import { Client } from "@gradio/client";
import fs from 'fs';

async function test() {
  try {
    console.log("Connecting to TripoSR...");
    const client = await Client.connect("stabilityai/TripoSR");
    console.log("Connected!");

    // We'll pass a random test image from the internet
    const testImageUrl = "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png";
    
    // Usually endpoint is /to_3d or /predict
    // Let's use view_api to see what's available
    const apiInfo = await client.view_api();
    console.log("API Info:", JSON.stringify(apiInfo, null, 2));

  } catch (err) {
    console.error("Error:", err);
  }
}

test();
