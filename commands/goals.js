const dbFind = require("./database/find.js");

module.exports = {
    name: "goals",
    aliases: ['goal'],
    run: async (client, channel, message, tags, arguments) => {
        const link = await dbFind.run(channel, 'donation_goals_link');
        if (link) {
            client.say(channel, `Mes donations goals : ${link}`);
        } else {
            client.action(channel, `ne trouve pas de lien dans sa mémoire.`);
        }
    }
}
