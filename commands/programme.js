const dbFind = require("./database/find.js");

module.exports = {
    name: "programme",
    aliases: ['prog', 'planning'],
    run: async (client, channel, message, tags, arguments) => {
        const link = await dbFind.run(channel, 'planning_link');
        if (link) {
            client.say(channel, `Le planning du WE : ${link}`);
        } else {
            client.action(channel, `ne trouve pas de lien dans sa mémoire.`);
        }
    }
}
