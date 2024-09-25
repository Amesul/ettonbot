module.exports = {
    // Nom de la commande
    name: "asso",
    // Alias pour la commande, permettant d'utiliser d'autres mots pour l'invoquer
    aliases: ['beneficiaire', 'enavanttoutes', 'association', 'eat'],

    // Fonction exécutée lorsque la commande est appelée
    run: async (client, channel, message, tags, arguments) => {
        // Envoi d'un message dans le canal Twitch indiquant des informations sur l'association
        client.say(channel, 'Fondée en 2013, l’association En avant toute(s) lutte pour l’égalité des genres et contre les violences faites aux femmes, aux jeunes et aux personnes LGBTQIA+. Son équipe conseille et redirige les victimes à travers un tchat en ligne anonyme et bienveillant sur https://commentonsaime.fr. Son équipe de prévention intervient auprès des étudiant·es pour aborder l’égalité et les comportements sexistes, et forme les professionnel·les de la jeunesse et le grand public à réagir face aux violences.');
    }
}