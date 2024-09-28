// Importation des bibliothèques externes
const express = require('express'); // Framework pour créer des applications web
const axios = require('axios').default; // Bibliothèque pour faire des requêtes HTTP
const cron = require('node-cron'); // Bibliothèque pour la planification de tâches
const {MongoClient, ServerApiVersion} = require("mongodb"); // Importation de MongoDB
const TMI = require('tmi.js'); // Bibliothèque pour interagir avec l'API Twitch IRC
const fs = require('fs'); // Bibliothèque pour les opérations de fichiers

// Chargement des variables d'environnement à partir du fichier .env
require('dotenv').config();

// Messages automatisés à envoyer
const automatedMessages = ['Il n\'y a pas de petit don, chaque euro compte !', `Cause à effet Vol. 3, l\'album composé par les artistes de Résonances est dispo ici : ${process.env.URL_ALBUM}`, `La boutique est ouverte ! Achetez votre t-shirt et votre totebag aux couleurs de l\'événement ici : ${process.env.URL_BOUTIQUE}. Design par Thelkana :bleedPurple:`, 'Fondée en 2013, l’association En avant toute(s) lutte pour l’égalité des genres et contre les violences faites aux femmes, aux jeunes et aux personnes LGBTQIA+. Son équipe conseille et redirige les victimes à travers un tchat en ligne anonyme et bienveillant sur https://commentonsaime.fr. Son équipe de prévention intervient auprès des étudiant·es pour aborder l’égalité et les comportements sexistes, et forme les professionnel·les de la jeunesse et le grand public à réagir face aux violences.', 'Marathon caritatif créé en 2021, Et Ta Cause réunit chaque année plusieurs dizaines de créateur·ices de contenu le temps d’un week-end avec deux objectifs : motiver des dons pour une association tout en sensibilisant sur les violences patriarcales. En trois éditions, c’est plus de 140 000€ qui ont été récoltés pour soutenir la Fondation des Femmes (2021), En avant toute(s) (2022) et le Planning Familial (2023).',];

// Map pour stocker les paramètres des messages automatiques par chaîne
const automaticMessageSettings = new Map();
// Map pour stocker le statut VIP par chaîne
const channelVipStatus = new Map();

// Commandes
// Map pour stocker les gestionnaires de commandes
const commands = new Map();
// Lecture des fichiers de commandes dans le répertoire ./commands
const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of files) {
    const command = require(`./commands/${file}`); // Importation du module de commande
    commands.set(command.name, command); // Stockage de la commande par son nom
    for (const alias of command.aliases) {
        commands.set(alias, command); // Stockage de la commande par ses alias également
    }
}

// Configuration du client MongoDB
const database = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1, strict: true, deprecationErrors: true,
    }
});

(async () => {
    // Récupérer la liste des streamers
    const streamerChannels = [];
    await axios.get('https://amesul.tv/api/v1/streamers', {
        headers: {'Authorization': process.env.API_TOKEN}
    }).then((response) => {
        for (const obj of response.data) {
            streamerChannels.push(obj.login); // Ajouter le login de chaque streamer à la liste
        }
    });

    // Configuration du client TMI
    const client = new TMI.Client({
        options: {
            debug: process.env.APP_ENV !== 'production', joinInterval: 300,
        }, identity: {
            username: process.env.TWITCH_USERNAME, password: `oauth:${process.env.ACCESS_TOKEN}`,
        }, channels: process.env.APP_ENV === 'production' ? streamerChannels : ['amesul'] // Se connecter aux chaînes récupérées
    });

    await client.connect(); // Connecter le client TMI

    // Initialiser les paramètres de message automatique pour chaque chaîne
    for (const channel of streamerChannels) {
        automaticMessageSettings.set(channel, {count: 0, interval: 5, rate_limit: 20}); // Définir les paramètres initiaux
        channelVipStatus.set(channel, true); // Supposer que toutes les chaînes commencent avec un statut VIP
    }

    // Mettre à jour les configurations à partir de la base de données
    await setStreamersSettings(streamerChannels);

    // Vérifier la date actuelle pour activer les messages automatiques
    const currentDate = new Date();
    const cutoffDate = new Date(currentDate.getFullYear(), 9, 4, 15, 0, 0); // Octobre est le mois 9 (index basé sur 0)

    // Activer l'envoi de messages automatiques si la date est atteinte
    if (currentDate >= cutoffDate) {
        for (const channel of streamerChannels) {
            setInterval(() => {
                if (channelVipStatus.get(channel)) {
                    let rand = Math.floor(Math.random() * automatedMessages.length); // Choisir un message aléatoire
                    client.say(channel, automatedMessages[rand]); // Envoyer le message à la chaîne
                }
            }, automaticMessageSettings.get(channel).interval * 60 * 1000); // Définir l'intervalle pour l'envoi des messages
        }
    }

    // Mettre à jour périodiquement les configurations pour les garder à jour
    setInterval(async () => {
        await setStreamersSettings(streamerChannels);
    }, 10 * 60 * 1000); // Mettre à jour toutes les 10 minutes

    // Compteur de messages
    client.on('message', (channel, tags, message, self) => {
        if (self || message.startsWith(process.env.PREFIX)) return; // Ignorer les messages du bot et les commandes
        if (automaticMessageSettings.get(channel).count >= automaticMessageSettings.get(channel).rate_limit) {
            automaticMessageSettings.get(channel).count = 0; // Réinitialiser le compteur si la limite est atteinte
        } else {
            automaticMessageSettings.get(channel).count++; // Incrémenter le compteur pour les messages reçus
        }
    });

    // Gestionnaire de commandes
    client.on('message', (channel, tags, message, self) => {
        if (self || !message.startsWith(process.env.PREFIX)) return; // Ignorer les messages du bot et ceux qui ne sont pas des commandes
        if (!channelVipStatus.get(channel)) return client.action(channel, 'ne peut pas être utilisé sans le rôle VIP.'); // Notifier si pas VIP

        const arguments = message.slice(1).split(' '); // Extraire les arguments de commande
        const commandName = arguments.shift().toLowerCase(); // Obtenir le nom de la commande

        if (commands.has(commandName)) {
            const isAdmin = tags.mod || tags['badges-raw']?.includes('broadcaster');
            if (commands.get(commandName).admin && !isAdmin) return;
            try {
                commands.get(commandName).run(client, channel, message, tags, arguments); // Exécuter la commande
            } catch (e) {
                console.error(e); // Log des erreurs
            }
        }
    });

    // Mise à jour du statut VIP en fonction des tags de message
    client.on('message', (channel, tags, message, self) => {
        if (self) {
            channelVipStatus.set(channel, !!tags.badges?.vip); // Mettre à jour le statut VIP si le message provient du bot
        }
    });

    // Initialisation de l'application Express
    const app = express();
    const port = process.env.APP_PORT || 3000; // Définir le port du serveur
    const hostname = process.env.APP_URL || 'localhost'; // Définir l'hôte du serveur

    // Fonction pour redémarrer le bot
    const restartBot = async () => {
        try {
            // Déconnecter le client existant
            await client.disconnect().catch(console.error);

            // Redémarrer le client TMI
            await client.connect();
            console.log('Bot redémarré automatiquement.'); // Log du redémarrage automatique
        } catch (e) {
            console.error(e);
        }
    };

    // Planification du redémarrage quotidien à 3h du matin
    cron.schedule('0 3 * * *', () => {
        restartBot();
    });

    // Endpoint pour redémarrer le bot manuellement
    app.post('/api/restart', (req, res) => {
        const token = req.headers.authorization;

        // Valider le token
        if (token !== process.env.API_TOKEN) {
            console.log('Invalid token.')
            return res.status(403).json({message: 'Invalid token.'}); // Réponse de token invalide
        }

        // Vérifier si la date actuelle est avant le 4 octobre à 15h00
        if (new Date() < cutoffDate) {
            restartBot();
            res.status(200).json({message: 'Bot redémarré avec succès'}); // Réponse de redémarrage réussie
        } else {
            res.status(403).json({message: 'Le redémarrage du bot n\'est plus autorisé après le 4 octobre à 15h.'}); // Réponse de coupure
        }
    });

    // Démarrer le serveur
    app.listen(port, hostname, () => {
        console.log(`Serveur à l'écoute sur ${hostname}:${port}`); // Log du démarrage du serveur
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