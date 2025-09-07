// server.js
const express = require("express");
const app = express();

app.get("/oauth/redirect", (req, res) => {
  console.log("OAuth redirected with query:", req.query);

  // Support both implicit (token) and code flow
  const token = req.query.access_token || req.query.code;

  if (token) {
    // Redirect into the Expo app via deep link
    return res.redirect(`gigagent4u://oauth/redirect#access_token=${token}`);
  }

  res.send("No access token found in redirect");
});

app.listen(8080, () => {
  console.log("OAuth redirect server running at http://localhost:8080");
});
