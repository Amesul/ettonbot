require('dotenv').config();

module.exports = {
    name: "tshirt",
    aliases: ['tshirts', 'boutique', 'store'],
    run: async (client, channel, message, tags, arguments) => {
        client.say(channel, `Cette année encore, il y a des supers t-shirts et totebag en vente sur : ${process.env.URL_BOUTIQUE}. Design par Thelkana :bleedPurple:`);
    }
}