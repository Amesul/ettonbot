require('dotenv').config();
const dbFind = require("./database/find.js");

module.exports = {
    name: "don",
    aliases: ['dons', 'donation', 'donations', 'donate'],
    run: async (client, channel, message, tags, arguments) => {
        const link = await dbFind.run(channel, 'slc_link');
        if (link) {
            client.say(channel, `Pour faire un don ${process.env.ASSO}, c'est par ici : ${link}`);
        } else {
            client.action(channel, `ne trouve pas de lien dans sa mémoire.`);
        }
    }
}