const fetch = require('node-fetch'); // Ensure node-fetch is available or use native fetch if node 18+

async function testLogin() {
  const url = "https://002-backend.vercel.app/api/login";
  console.log(`Testing login to: ${url}`);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "admin01",
        password: "123456"
      })
    });

    console.log(`Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log("Response Body:", text);
    
    // Check headers for CORS just in case
    console.log("Access-Control-Allow-Origin:", res.headers.get("access-control-allow-origin"));

  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

testLogin();
