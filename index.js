var express = require("express");
const path = require("path");
var app = express();

app.use(express.json());
app.use(express.static("public"));

const clients = new Set();

app.get("/", (req, res) => {
  try {
    res.sendFile("index.html", { root: path.join(__dirname, "public") });
  } catch (error) {
    console.error(error);
  }
});

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.add(res);

  req.on("close", () => {
    clients.delete(res);
  });
});

app.post("/remove-key/:leaderName", (req, res) => {
  const leaderName = req.params.leaderName;

  for (const client of clients) {
    client.write(`event: message\ndata: ${JSON.stringify({ leaderName })}\n\n`);
  }

  res.status(200).send({ message: "Key removal event sent." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
