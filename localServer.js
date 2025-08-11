// localServer.js
const localtunnel = require("localtunnel");

(async () => {
  const subdomain = "myspotifymcgtestretro";
  const port = 4000;

  const startTunnel = async () => {
    try {
      const tunnel = await localtunnel({ port, subdomain });
      console.log(`Tunnel running at ${tunnel.url}`);

      tunnel.on("close", () => {
        console.log("Tunnel closed. Restarting...");
        setTimeout(startTunnel, 2000);
      });
    } catch (err) {
      console.error("Tunnel error:", err);
      setTimeout(startTunnel, 5000);
    }
  };

  startTunnel();
})();
