// Chargement des variables d'environnement à partir d'un fichier .env
require('dotenv').config();
// Importation de la fonction de recherche dans la base de données
const dbFind = require("./database/find.js");

module.exports = {
    // Nom de la commande
    name: "don",
    // Alias pour la commande, permettant d'utiliser d'autres mots pour l'invoquer
    aliases: ['dons', 'donation', 'donations', 'donate'],

    // Fonction exécutée lorsque la commande est appelée
    run: async (client, channel, message, tags, arguments) => {
        // Recherche du lien SLC associé au canal via la fonction dbFind
        const link = await dbFind.run(channel, 'slc_link');

        // Vérifie si un lien a été trouvé
        if (link) {
            // Envoi d'un message contenant le lien pour faire un don
            client.say(channel, `Pour faire un don à ${process.env.ASSO}, c'est par ici : ${link}`);
        } else {
            // Envoi d'un message d'action si aucun lien n'est trouvé
            client.action(channel, `ne trouve pas de lien dans sa mémoire.`);
        }
    }
}