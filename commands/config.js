const {ServerApiVersion, MongoClient} = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    name: "config",
    aliases: ['configuration', 'setup'],
    run: async (client, channel, message, tags, arguments) => {
        const arg = arguments[1];

        let updateToPerform;
        switch (arguments[0]) {
            case 'slc':
                updateToPerform = {$set: {login: channel, slc_link: arg}};
                break;
            case 'prog':
                updateToPerform = {$set: {login: channel, 'planning_link': arg}};
                break;
            case 'goals':
                updateToPerform = {$set: {login: channel, donation_goals_link: arg}};
                break;
            case 'limite':
                updateToPerform = {$set: {login: channel, auto_messages_rate_limit: arg}};
                break;
            case 'intervalle':
                updateToPerform = {$set: {login: channel, auto_messages_interval: arg}};
                break;
            default:
                return client.say(channel, `Erreur de syntaxe: ${arguments[0]}`);
        }

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

            await collection.updateOne({login: channel}, updateToPerform, {upsert: true});
        } finally {
            client.say(channel, 'Configuration enregistrée.');

            // Ensures that the client will close when you finish/error
            await database.close();
        }
    }
}
