module.exports = {
    name: "clips",
    aliases: ['clip', 'souvenir'],
    run: async (client, channel, message, tags, arguments) => {
        client.say(channel, "N'oubliez pas de clipper les meilleurs moments de l'event !")
    }
}