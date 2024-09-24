// Chargement des variables d'environnement à partir d'un fichier .env
require('dotenv').config();

module.exports = {
    // Nom de la commande
    name: "tshirt",
    // Alias pour la commande
    aliases: ['tshirts', 'boutique', 'store'],

    // Fonction exécutée lorsque la commande est appelée
    run: async (client, channel, message, tags, arguments) => {
        // Envoi d'un message dans le canal avec le lien vers la boutique de t-shirts et totebags
        client.say(channel, `Cette année encore, il y a des supers t-shirts et totebag en vente sur : ${process.env.URL_BOUTIQUE}. Design par Thelkana :bleedPurple:`);
    }
}