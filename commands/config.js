// Importation des classes nécessaires depuis le package MongoDB
const {ServerApiVersion, MongoClient} = require("mongodb");
// Importation du package dotenv pour charger les variables d'environnement
require("dotenv").config();

module.exports = {
    // Nom de la commande
    name: "config",
    // Alias pour la commande, permettant d'utiliser d'autres mots pour l'invoquer
    aliases: ['configuration', 'setup'],
    // Commande reservée aux admin
    admin: true,
    // Fonction exécutée lorsque la commande est appelée
    run: async (client, channel, message, tags, arguments) => {
        // Récupération du deuxième argument de la commande
        const arg = arguments[1];

        // Variable pour stocker l'opération de mise à jour à effectuer
        let updateToPerform;
        // Vérification du premier argument pour déterminer l'opération à réaliser
        switch (arguments[0]) {
            case 'slc':
                updateToPerform = {$set: {login: channel, slc_link: arg}}; // Mise à jour du lien SLC
                break;
            case 'prog':
                updateToPerform = {$set: {login: channel, 'planning_link': arg}}; // Mise à jour du lien de planning
                break;
            case 'goals':
                updateToPerform = {$set: {login: channel, donation_goals_link: arg}}; // Mise à jour du lien des objectifs de dons
                break;
            case 'limite':
                updateToPerform = {$set: {login: channel, auto_messages_rate_limit: arg}}; // Mise à jour de la limite de messages automatiques
                break;
            case 'intervalle':
                updateToPerform = {$set: {login: channel, auto_messages_interval: arg}}; // Mise à jour de l'intervalle entre les messages automatiques
                break;
            default:
                // Si l'argument n'est pas reconnu, envoi d'un message d'erreur
                return client.say(channel, `Erreur de syntaxe: ${arguments[0]}`);
        }

        // Création d'un client MongoClient avec les options de configuration de l'API stable
        const database = new MongoClient(process.env.MONGODB_URI, {
            serverApi: {
                version: ServerApiVersion.v1, strict: true, deprecationErrors: true,
            }
        });

        try {
            // Connexion du client à la base de données (optionnel à partir de v4.7)
            await database.connect();
            // Envoi d'une commande ping pour confirmer une connexion réussie
            await database.db("ettonbot").command({ping: 1});
            // Récupération de la collection "streamers" dans la base de données
            const collection = await database.db("ettonbot").collection("streamers");

            // Mise à jour ou insertion de la configuration du canal dans la base de données
            await collection.updateOne({login: channel}, updateToPerform, {upsert: true});
        } finally {
            // Envoi d'un message de confirmation dans le canal
            client.say(channel, 'Configuration enregistrée.');

            // Assure que le client sera fermé une fois terminé ou en cas d'erreur
            await database.close();
        }
    }
}