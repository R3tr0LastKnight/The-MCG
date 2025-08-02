const serverless = require("serverless-http");
const app = require("../index"); // Import your Express app

module.exports = serverless(app);
