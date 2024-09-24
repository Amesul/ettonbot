// Importation de la fonction dbFind pour interagir avec la base de données
const dbFind = require("./database/find.js");

module.exports = {
    // Nom de la commande
    name: "goals",
    // Alias pour la commande
    aliases: ['goal'],

    // Fonction exécutée lorsque la commande est appelée
    run: async (client, channel, message, tags, arguments) => {
        // Récupération du lien des objectifs de dons depuis la base de données
        const link = await dbFind.run(channel, 'donation_goals_link');

        // Vérification si un lien a été trouvé
        if (link) {
            // Envoi du lien des objectifs de dons dans le canal
            client.say(channel, `Mes donations goals : ${link}`);
        } else {
            // Action pour indiquer qu'aucun lien n'a été trouvé
            client.action(channel, `ne trouve pas de lien dans sa mémoire.`);
        }
    }
}