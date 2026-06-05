async function testEndpoint() {
  console.log("Testing POST /api/generate-dynamic-3d...");
  try {
    const res = await fetch("http://localhost:3001/api/generate-dynamic-3d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
      })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch(e) {
    console.error("Error:", e);
  }
}
testEndpoint();
