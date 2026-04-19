const express = require('express');
const SampQuery = require('samp-query');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/status', (req, res) => {
  SampQuery({
    host: '51.75.44.14',
    port: 2264
  }, (err, server) => {

    if (err) {
      return res.json({ online: false });
    }

    res.json({
      online: true,
      players: server.online,
      maxplayers: server.maxplayers,
      hostname: server.hostname,
      gamemode: server.gamemode,
      mapname: server.mapname
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on port " + PORT));