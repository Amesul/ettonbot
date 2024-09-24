// Importation de la fonction dbFind pour interagir avec la base de données
const dbFind = require("./database/find.js");

module.exports = {
    // Nom de la commande
    name: "programme",
    // Alias pour la commande
    aliases: ['prog', 'planning'],

    // Fonction exécutée lorsque la commande est appelée
    run: async (client, channel, message, tags, arguments) => {
        // Récupération du lien du planning depuis la base de données
        const link = await dbFind.run(channel, 'planning_link');

        // Vérification si un lien a été trouvé
        if (link) {
            // Envoi du lien du planning dans le canal
            client.say(channel, `Le planning du WE : ${link}`);
        } else {
            // Action pour indiquer qu'aucun lien n'a été trouvé
            client.action(channel, `ne trouve pas de lien dans sa mémoire.`);
        }
    }
}