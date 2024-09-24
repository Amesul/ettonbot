module.exports = {
    // Nom de la commande
    name: "event",
    // Alias pour la commande, permettant d'utiliser d'autres mots pour l'invoquer
    aliases: ['etc', 'ettacause', 'evenement'],

    // Fonction exécutée lorsque la commande est appelée
    run: async (client, channel, message, tags, arguments) => {
        // Envoi d'un message détaillant l'événement caritatif
        await client.say(channel, 'Marathon caritatif créé en 2021, Et Ta Cause réunit chaque année plusieurs dizaines de créateur·ices de contenu le temps d’un week-end avec deux objectifs : motiver des dons pour une association tout en sensibilisant sur les violences patriarcales. En trois éditions, c’est plus de 140 000€ qui ont été récoltés pour soutenir la Fondation des Femmes (2021), En avant toute(s) (2022) et le Planning Familial (2023).');

        // Envoi d'un message avec un lien pour ne manquer aucune information
        client.say(channel, 'Pour ne manquer aucune info : https://linktr.ee/ettacause');
    }
}