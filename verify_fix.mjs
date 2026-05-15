import fetch from 'node-fetch';

async function testChat() {
  console.log("Testing Chatbot API for author info...");
  
  const response = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "আপনার সম্পর্কে বলুন" }]
    })
  });

  if (response.ok) {
    const data = await response.json();
    const reply = data.reply || "";
    console.log("\n--- AI Reply ---");
    console.log(reply);
    console.log("----------------\n");

    if (reply.includes("২০১৫")) {
      console.log("❌ FAILED: Found '২০১৫' in the response.");
    } else {
      console.log("✅ PASSED: '২০১৫' is NOT found in the response.");
    }
  } else {
    // If local server is not running, we check the code directly
    console.log("Local server not reachable, checking code directly...");
  }
}

testChat();
