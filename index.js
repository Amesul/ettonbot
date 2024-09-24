const TMI = require('tmi.js');
const fs = require('fs');
const {MongoClient, ServerApiVersion} = require("mongodb");
const axios = require('axios').default;
require('dotenv').config();

// Automate messages
const messages = ['Il n\'y a pas de petit don, chaque euro compte !',
    `Cause à effet Vol. 3, l\'album composé par les artistes de Résonances est dispo ici : ${process.env.URL_ALBUM}`,
    `La boutique est ouverte ! Achetez votre t-shirt et votre totebag aux couleurs de l\'événement ici : ${process.env.URL_BOUTIQUE}. Design par Thelkana :bleedPurple:`,
    'Fondée en 2013, l’association En avant toute(s) lutte pour l’égalité des genres et contre les violences faites aux femmes, aux jeunes et aux personnes LGBTQIA+. Son équipe conseille et redirige les victimes à travers un tchat en ligne anonyme et bienveillant sur https://commentonsaime.fr. Son équipe de prévention intervient auprès des étudiant·es pour aborder l’égalité et les comportements sexistes, et forme les professionnel·les de la jeunesse et le grand public à réagir face aux violences.',
    'Marathon caritatif créé en 2021, Et Ta Cause réunit chaque année plusieurs dizaines de créateur·ices de contenu le temps d’un week-end avec deux objectifs : motiver des dons pour une association tout en sensibilisant sur les violences patriarcales. En trois éditions, c’est plus de 140 000€ qui ont été récoltés pour soutenir la Fondation des Femmes (2021), En avant toute(s) (2022) et le Planning Familial (2023).',
];

const autoMessagesSettings = new Map();
const isVip = new Map();

// Commands
const commands = new Map();
const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of files) {
    const command = require(`./commands/${file}`);
    commands.set(command.name, command);
    for (const alias of command.aliases) {
        commands.set(alias, command);
    }
}

// MongoDB client config
const database = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1, strict: true, deprecationErrors: true,
    }
});

(async () => {
    // Get streamers list
    const channels = [];
    await axios.get('https://amesul.tv/api/v1/streamers', {
        headers: {'Authorization': process.env.API_TOKEN}
    }).then((response) => {
        for (const obj of response.data) {
            channels.push(obj.login);
        }
    });

    // TMI client config
    const client = new TMI.Client({
        options: {
            debug: process.env.APP_ENV !== 'production', joinInterval: 300,
        }, identity: {
            username: process.env.TWITCH_USERNAME, password: `oauth:${process.env.ACCESS_TOKEN}`,
        }, channels: channels
    });

    await client.connect()

    for (const channel of channels) {
        autoMessagesSettings.set(channel, {count: 0, interval: 5, rate_limit: 20});
        isVip.set(channel, true);

        client.say(channel, 'est connecté.')
    }
    // Update configs
    await setStreamersSettings(channels)

    // Auto messages sender
    // for (const channel of channels) {
    //     setInterval(() => {
    //         if (isVip.get(channel)) {
    //             let rand = Math.floor(Math.random() * messages.length);
    //             client.say(channel, messages[rand]);
    //         }
    //     }, autoMessagesSettings.get(channel).interval /*m*/ * 60  /*s*/ * 1000/*ms*/);
    // }

    // Maintain config up to date
    setInterval(async () => {
        await setStreamersSettings(channels);
    }, 10 /*m*/ * 60 /*s*/ * 1000 /*ms*/);

    // Messages counter
    client.on('message', (channel, tags, message, self) => {
        if (self || message.startsWith(process.env.PREFIX)) return;
        if (autoMessagesSettings.get(channel).count >= autoMessagesSettings.get(channel).rate_limit) {
            autoMessagesSettings.get(channel).count = 0;
        } else {
            autoMessagesSettings.get(channel).count++;
        }
    });

    // Command handler
    client.on('message', (channel, tags, message, self) => {
        if (self || !message.startsWith(process.env.PREFIX)) return;
        if (!isVip.get(channel)) return client.action(channel, 'ne peut pas être utilisé sans le rôle VIP.');

        const arguments = message.slice(1).split(' ');
        const commandName = arguments.shift().toLowerCase();

        if (commands.has(commandName)) {
            try {
                commands.get(commandName).run(client, channel, message, tags, arguments);
            } catch (e) {
                console.error(e)
            }
        }
    });

    // Update VIP status
    client.on('message', (channel, tags, message, self) => {
        if (self) {
            isVip.set(channel, !!tags.badges?.vip);
        }
    })
})();

// Retrieve users settings and update the corresponding Map
async function setStreamersSettings(channels) {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await database.connect();
        // Send a ping to confirm a successful connection
        await database.db("ettonbot").command({ping: 1});
        const collection = await database.db("ettonbot").collection("streamers");

        // For each channel, pull the data from DB and insert in autoMessagesSettings
        for (const channel of channels) {
            const res = await collection.findOne({login: channel})
            if (res) {
                const rate_limit = res['auto_messages_rate_limit'];
                autoMessagesSettings.get(channel).rate_limit = rate_limit ? parseInt(rate_limit) : 0;

                const interval = res['auto_messages_interval'];
                autoMessagesSettings.get(channel).interval = interval ? parseInt(interval) : 5;
            }
        }
    } finally {
        // Ensures that the client will close when you finish/error
        await database.close();
    }
    return autoMessagesSettings;
}