// Load environment variables from a .env file into process.env
require('dotenv').config();

// Export the module with command metadata and functionality
module.exports = {
    // Command name
    name: "album",
    // List of aliases for the command
    aliases: ['musique', 'music', 'cd', 'resonances'],

    // Function to run when the command is executed
    run: async(client, message, arguments, tags, channel) => {
        // Send a message to the specified channel promoting the album
        client.say(channel, `Achetez l'album concocté par Résonances ici : ${process.env.URL_ALBUM} ! L'intégralité des fonds sont reversés à En avant toute(s).`);
    }
}