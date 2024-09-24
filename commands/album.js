require('dotenv').config();

module.exports = {
    name: "album",
    aliases: ['musique', 'music', 'cd', 'resonances'],
    run: async(client, message, arguments, tags, channel) => {
        client.say(channel, `Achetez l'album concoté par Résonances ici : ${process.env.URL_ALBUM} ! L'intégralité des fonds sont reversés à En avant toute(s).`);
    }
}