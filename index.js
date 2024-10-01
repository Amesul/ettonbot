// Importation des bibliothèques externes
const express = require('express'); // Framework pour créer des applications web, comme des API
const bodyParser = require("body-parser"); // Permet d'analyser le corps des requêtes HTTP (par ex. pour les formulaires ou JSON)
const axios = require('axios').default; // Pour faire des requêtes HTTP (GET, POST, etc.)
const cron = require('node-cron'); // Utilisé pour planifier des tâches récurrentes, comme des redémarrages réguliers
const {MongoClient, ServerApiVersion} = require("mongodb"); // MongoDB pour interagir avec la base de données
const TMI = require('tmi.js'); // Bibliothèque pour interagir avec l'API Twitch via IRC (chat)
const fs = require('fs'); // Gestion des fichiers, notamment pour lire les commandes

// Chargement des variables d'environnement à partir du fichier .env (contient des données sensibles comme les tokens)
require('dotenv').config();

// Messages automatisés à envoyer, comprenant des messages d'information sur l'événement et des liens
const automatedMessages = ['Il n\'y a pas de petit don, chaque euro compte !', `Cause à effet Vol. 3, l\'album composé par les artistes de Résonances est dispo ici : ${process.env.URL_ALBUM}`, `La boutique est ouverte ! Achetez votre t-shirt et votre totebag aux couleurs de l\'événement ici : ${process.env.URL_BOUTIQUE}. Design par Thelkana :bleedPurple:`, 'Fondée en 2013, l’association En avant toute(s) lutte pour l’égalité des genres et contre les violences faites aux femmes, aux jeunes et aux personnes LGBTQIA+. Son équipe conseille et redirige les victimes à travers un tchat en ligne anonyme et bienveillant sur https://commentonsaime.fr. Son équipe de prévention intervient auprès des étudiant·es pour aborder l’égalité et les comportements sexistes, et forme les professionnel·les de la jeunesse et le grand public à réagir face aux violences.', 'Marathon caritatif créé en 2021, Et Ta Cause réunit chaque année plusieurs dizaines de créateur·ices de contenu le temps d’un week-end avec deux objectifs : motiver des dons pour une association tout en sensibilisant sur les violences patriarcales. En trois éditions, c’est plus de 140 000€ qui ont été récoltés pour soutenir la Fondation des Femmes (2021), En avant toute(s) (2022) et le Planning Familial (2023).',];

// Map pour stocker les paramètres des messages automatiques par chaîne (par exemple, fréquence d'envoi, limite de messages)
const automaticMessageSettings = new Map();

// Map pour stocker le statut VIP par chaîne (chaînes ayant le statut VIP)
const channelVipStatus = new Map();

// Date à partir de laquelle certaines fonctionnalités du bot seront activées (4 octobre 2024 à 13h)
const cutoffDate = new Date(2024, 9, 4, 13, 0, 0);

// Commandes du bot Twitch
// Map pour stocker les gestionnaires de commandes (chargés dynamiquement depuis des fichiers)
const commands = new Map();

// Chargement des fichiers de commandes dans le répertoire ./commands et ajout des commandes à la Map
const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of files) {
    const command = require(`./commands/${file}`); // Importation du fichier de commande
    commands.set(command.name, command); // Ajout de la commande par son nom dans la Map
    for (const alias of command.aliases) {
        commands.set(alias, command); // Les alias de commande sont également ajoutés pour être reconnus
    }
}

// Configuration du client MongoDB
const database = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1, strict: true, deprecationErrors: true, // Paramètres stricts pour éviter les erreurs futures
    }
});

// Fonction pour récupérer la liste des streamers de l'API externe, triée par login
async function getStreamerChannels() {
    const response = await axios.get('https://amesul.tv/api/v1/streamers', {
        headers: {'Authorization': process.env.API_TOKEN} // Autorisation via token
    });

    // Environnement de production ou développement
    const streamers = process.env.APP_ENV === 'production' ? response.data.map(streamer => streamer.login) : ['ettacause', 'amesul'];

    return streamers.sort(); // Retourner la liste des streamers triée
}

// Configuration du client TMI pour se connecter aux channels Twitch des streamers
async function setupTMIClient(streamerChannels) {
    const client = new TMI.Client({
        options: {
            debug: process.env.APP_ENV !== 'production', // Active le mode debug en développement
            joinInterval: 300, // Intervalle pour rejoindre plusieurs channels afin d'éviter une surcharge
        }, identity: {
            username: process.env.TWITCH_USERNAME, // Nom d'utilisateur du bot Twitch
            password: `oauth:${process.env.ACCESS_TOKEN}`, // Token d'accès OAuth pour Twitch IRC
        }, channels: streamerChannels // Liste des channels à rejoindre
    });

    await client.connect(); // Connexion au serveur IRC de Twitch
    return client; // Retourner le client connecté
}

// Initialiser les paramètres de messages automatiques et le statut VIP pour chaque chaîne
function initializeChannelSettings(streamerChannels) {
    streamerChannels.forEach(channel => {
        automaticMessageSettings.set(channel, {count: 0, interval: 5, rate_limit: 20}); // Intervalle d'envoi par défaut : 5 minutes
        channelVipStatus.set(channel, true); // Le statut VIP est activé par défaut
    });
}

// Planifier l'envoi des messages automatiques sur chaque chaîne avec un intervalle défini
function setupAutomaticMessages(client, streamerChannels) {
    streamerChannels.forEach(channel => {
        const {interval} = automaticMessageSettings.get(channel); // Récupérer l'intervalle pour chaque chaîne
        setInterval(() => {
            if (channelVipStatus.get(channel) && new Date() >= cutoffDate) { // Vérifier le statut VIP et la date limite
                const randomMessage = automatedMessages[Math.floor(Math.random() * automatedMessages.length)]; // Message aléatoire
                client.say(channel, randomMessage); // Envoyer le message dans le chat
            }
        }, interval * 60 * 1000); // Conversion de l'intervalle en millisecondes
    });
}

// Fonction principale pour initialiser le bot et démarrer ses fonctionnalités
(async () => {
    const streamerChannels = await getStreamerChannels(); // Récupérer la liste des streamers
    const client = await setupTMIClient(streamerChannels); // Configurer le client Twitch

    initializeChannelSettings(streamerChannels); // Initialiser les paramètres des chaînes
    await setStreamersSettings(streamerChannels); // Charger les paramètres des streamers depuis la base de données

    setupAutomaticMessages(client, streamerChannels); // Planifier les messages automatiques

    // Mettre à jour les paramètres des streamers toutes les 10 minutes
    setInterval(async () => {
        await setStreamersSettings(streamerChannels);
    }, 10 * 60 * 1000); // Toutes les 10 minutes

    // Gestion des messages et des commandes dans le chat Twitch
    client.on('message', (channel, tags, message, self) => {
        if (self) return; // Ignorer les messages envoyés par le bot lui-même

        const settings = automaticMessageSettings.get(channel); // Récupérer les paramètres de la chaîne

        // Si le message ne commence pas par le préfixe (c'est donc pas une commande)
        if (!message.startsWith(process.env.PREFIX)) {
            settings.count = settings.count >= settings.rate_limit ? 0 : settings.count + 1; // Incrémenter le compteur de messages
            return; // Sortir si ce n'est pas une commande
        }

        // Si la chaîne n'a pas le statut VIP, refuser les commandes
        if (!channelVipStatus.get(channel)) {
            return client.action(channel, 'Commandes non disponibles sans le rôle VIP.');
        }

        // Traitement de la commande
        const args = message.slice(1).split(' '); // Extraction des arguments de la commande
        const commandName = args.shift().toLowerCase(); // Le premier mot est le nom de la commande

        // Si la commande existe
        if (commands.has(commandName)) {
            const command = commands.get(commandName);
            const isAdmin = tags.mod || tags.badges?.includes('broadcaster'); // Vérifier si l'utilisateur est admin (modérateur ou propriétaire du canal)
            if (command.admin && !isAdmin || (new Date() <= cutoffDate && !isAdmin)) return; // Si admin nécessaire mais non admin, refuser

            try {
                command.run(client, channel, message, tags, args); // Exécuter la commande
            } catch (err) {
                console.error(err); // Log des erreurs
            }
        }
    });

    // Mise à jour du statut VIP si un message est envoyé par le bot
    client.on('message', (channel, tags, message, self) => {
        if (self) {
            channelVipStatus.set(channel, !!tags.badges?.vip); // Mettre à jour le statut VIP si le message provient du bot
        }
    });

    // EMOTES HANDLER
    // Constantes pour les noms d'émotes
    const EMOTES = {
        green: 'ettacaGREEN', orange: 'ettacaORANGE', red: 'ettacaRED',
    };

    // Initialisation des compteurs et utilisateurs pour chaque émote
    client.emoteCounter = new Map(Object.keys(EMOTES).map(emote => [emote, {count: 0, users: new Set()}]));

    // Fonction pour incrémenter les compteurs et ajouter l'utilisateur
    const incrementEmoteCounter = (emoteName, userId) => {
        const emoteData = client.emoteCounter.get(emoteName);
        if (!emoteData.users.has(userId)) {
            emoteData.count++;
            emoteData.users.add(userId);
        }
    };

    // Fonction pour afficher les résultats dans le chat
    const displayResults = async (channel) => {
        await client.say(channel, `J'ai compté ${client.emoteCounter.get('green').count} drapeaux verts. ${EMOTES.green}`);
        await client.say(channel, `Il y a eu ${client.emoteCounter.get('orange').count} drapeaux oranges. ${EMOTES.orange}`);
        await client.say(channel, `Et enfin, vous avez choisi ${client.emoteCounter.get('red').count} fois le drapeau rouge. ${EMOTES.red}`);
    };

    // Fonction pour réinitialiser les compteurs
    const resetCounters = () => {
        Object.keys(EMOTES).forEach(emote => {
            client.emoteCounter.set(emote, {count: 0, users: new Set()});
        });
    };

    client.on('message', async (channel, tags, message, self) => {
        if (self || channel !== '#ettacause') return;

        const userId = tags['user-id'];

        // Incrémentation des compteurs en fonction de l'émote contenue dans le message
        if (message.includes(EMOTES.green)) {
            incrementEmoteCounter('green', userId);
        } else if (message.includes(EMOTES.orange)) {
            incrementEmoteCounter('orange', userId);
        } else if (message.includes(EMOTES.red)) {
            incrementEmoteCounter('red', userId);
        } else {
            // Vérification des permissions de l'utilisateur (modérateur ou propriétaire du canal)
            const isAdmin = tags.mod || tags['badges-raw']?.includes('broadcaster');
            if (message === '!results' && isAdmin) {
                // Afficher les résultats et réinitialiser les compteurs
                await displayResults(channel);
                resetCounters();
            }
        }
    });

    // Initialisation de l'application Express
    const app = express();
    app.use(express.json()); // Utiliser express.json() plutôt que bodyParser qui est désormais intégré dans Express

    const port = process.env.APP_PORT || 3000; // Définir le port du serveur
    const hostname = process.env.APP_URL || 'localhost'; // Définir l'hôte du serveur

    // Fonction pour redémarrer le client TMI
    const restartBot = async (login = null) => {
        try {
            // Déconnecter le client existant
            await client.disconnect();

            // Si un login est fourni, on ajoute ce login à la liste des channels s'il n'y est pas déjà
            if (login) {
                if (!streamerChannels.includes(login)) {
                    streamerChannels.push(login); // Ajoute le login à la liste des channels
                    console.log(`Login ajouté à la liste des channels : ${login}`); // Log de l'ajout du login
                }
            }

            // Réinitialise la configuration du client TMI avec la liste mise à jour des channels
            await setupTMIClient(streamerChannels);

            // Reconnecter le client TMI
            await client.connect();

            // Log si le redémarrage a été fait pour un login spécifique ou de manière automatique
            if (login) {
                console.log(`Bot redémarré pour ${login}.`); // Log en cas de redémarrage pour un login
            } else {
                console.log('Bot redémarré automatiquement.'); // Log en cas de redémarrage automatique sans login
            }
        } catch (e) {
            // Log en cas d'erreur lors du redémarrage
            console.error('Erreur lors du redémarrage du bot:', e);
        }
    };

    // Endpoint pour redémarrer le bot manuellement
    app.post('/api/restart', (req, res) => {
        const token = req.headers.authorization;

        // Valider le token
        if (token !== process.env.API_TOKEN) {
            return res.status(401).json({message: '401 Unauthorized - Invalid token.'});
        }

        // Vérifier si la date actuelle est avant le 4 octobre à 15h00
        if (new Date() < cutoffDate) {
            const {login} = req.body;

            if (!login) {
                return res.status(400).json({message: '400 Bad Request - Login non fourni.'});
            }

            restartBot(login);
            return res.status(200).json({message: '200 OK - Bot redémarré avec succès'});
        } else {
            return res.status(403).json({
                message: '403 Forbidden - Le redémarrage du bot n\'est plus autorisé après le 4 octobre à 15h.'
            });
        }
    });

// Démarrer le serveur
    app.listen(port, hostname, () => {
        console.log(`Serveur en écoute sur http://${hostname}:${port}`); // Log du démarrage du serveur
    });

    // Planification du redémarrage quotidien à 3h du matin (1h UTC)
    cron.schedule('0 1 * * *', () => {
        restartBot();
    });
})();

// Récupère les paramètres des utilisateurs et met à jour la Map correspondante
async function setStreamersSettings(channels) {
    try {
        // Connecte le client au serveur MongoDB
        await database.connect();
        // Envoie un ping pour confirmer la connexion réussie
        await database.db("ettonbot").command({ping: 1});

        const collection = database.db("ettonbot").collection("streamers");

        // Pour chaque canal, récupère les données de la base de données et met à jour automaticMessageSettings
        for (const channel of channels) {
            const res = await collection.findOne({login: channel}); // Récupère les paramètres pour chaque canal
            if (res) {
                // Met à jour la limite de taux (rate limit)
                const rate_limit = res['auto_messages_rate_limit'];
                automaticMessageSettings.get(channel).rate_limit = rate_limit ? parseInt(rate_limit) : 0;

                // Met à jour l'intervalle d'envoi des messages automatiques
                const interval = res['auto_messages_interval'];
                automaticMessageSettings.get(channel).interval = interval ? parseInt(interval) : 5;
            }
        }
    } catch (error) {
        // Log l'erreur en cas d'échec de la récupération des paramètres
        console.error('Erreur lors de la récupération des paramètres des streamers :', error);
    } finally {
        // Assure que le client sera fermé s'il y a une erreur ou à la fin du traitement
        await database.close();
    }

    return automaticMessageSettings; // Retourne les paramètres mis à jour
}