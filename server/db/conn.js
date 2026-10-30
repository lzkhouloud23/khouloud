const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error("MONGO_URI must be set");
}
const client = new MongoClient(uri);
const databaseName = new URL(uri).pathname.replace(/^\/+|\/+$/g, "") || "employees";

let _db;

module.exports = {
  connectToMongoDB: async function () {
    await client.connect();
    _db = client.db(databaseName);
    console.log(`Successfully connected to MongoDB database "${databaseName}".`);
  },

  getDb: function () {
    if (!_db) {
      throw new Error("Database not initialized. Call connectToMongoDB first.");
    }
    return _db;
  },

  closeMongoDB: async function () {
    await client.close();
    console.log("MongoDB connection closed.");
  }
};
