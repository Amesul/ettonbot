const {MongoClient, ServerApiVersion} = require("mongodb");

module.exports = {
    run: async (channel, type) => {
        // Create a MongoClient with a MongoClientOptions object to set the Stable API version
        const database = new MongoClient(process.env.MONGODB_URI, {
            serverApi: {
                version: ServerApiVersion.v1, strict: true, deprecationErrors: true,
            }
        });

        try {
            // Connect the client to the server	(optional starting in v4.7)
            await database.connect();
            // Send a ping to confirm a successful connection
            await database.db("ettonbot").command({ping: 1});
            const collection = await database.db("ettonbot").collection("streamers");

            const res = await collection.findOne({login: channel})
            if (!res) {
                return false
            }
            return res[type];
        } finally {
            // Ensures that the client will close when you finish/error
            await database.close();
        }
    }
}