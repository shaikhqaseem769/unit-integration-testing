// server.js
const app = require('./app');
const mongodb = require('./mongodb/mongodb.connect');

const PORT = process.env.PORT || 4800;

(async () => {
  await mongodb.connect();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
