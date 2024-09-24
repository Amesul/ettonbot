// Exportation d'un module contenant la commande "clips"
module.exports = {
    // Nom de la commande
    name: "clips",
    // Alias pour la commande, permettant d'utiliser d'autres mots pour l'invoquer
    aliases: ['clip', 'souvenir'],

    // Fonction exécutée lorsque la commande est appelée
    run: async (client, channel, message, tags, arguments) => {
        // Envoi d'un message dans le canal Twitch pour rappeler aux utilisateurs de clipper les meilleurs moments de l'événement
        client.say(channel, "N'oubliez pas de clipper les meilleurs moments de l'event !");
    }
}