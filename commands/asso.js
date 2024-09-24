module.exports = {
    name: "asso",
    aliases: ['beneficiaire', 'enavanttoutes', 'association', 'eat'],
    run: async (client, channel, message, tags, arguments) => {
        client.say(channel, 'Fondée en 2013, l’association En avant toute(s) lutte pour l’égalité des genres et contre les violences faites aux femmes, aux jeunes et aux personnes LGBTQIA+. Son équipe conseille et redirige les victimes à travers un tchat en ligne anonyme et bienveillant sur https')
    }
}