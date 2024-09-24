const {MongoClient, ServerApiVersion} = require("mongodb");

// Export the module with a run function that takes a channel and a type as parameters
module.exports = {
    run: async (channel, type) => {
        // Create a MongoClient instance with options to set the Stable API version
        const database = new MongoClient(process.env.MONGODB_URI, {
            serverApi: {
                version: ServerApiVersion.v1, // Specify the version of the MongoDB server API
                strict: true, // Enforce strict mode for options
                deprecationErrors: true, // Throw errors for deprecated features
            }
        });

        try {
            // Connect the MongoDB client to the server (optional starting in v4.7)
            await database.connect();
            // Send a ping command to confirm a successful connection to the database
            await database.db("ettonbot").command({ping: 1});
            // Access the "streamers" collection from the "ettonbot" database
            const collection = await database.db("ettonbot").collection("streamers");

            // Find a document in the collection that matches the given channel login
            const res = await collection.findOne({login: channel});
            // If no document is found, return false
            if (!res) {
                return false;
            }
            // Return the value corresponding to the specified type from the found document
            return res[type];
        } finally {
            // Ensure that the MongoDB client closes when finished or if an error occurs
            await database.close();
        }
    }
}