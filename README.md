# EtTonBot

Chatbot Twitch à destination des streameur·euses de l'événement caritatif Et Ta Cause.

## Prérequis
S'enregistrer grâce à [ce lien](https://amesul.tv/streamers/register){:target="_blank"}. Il sera demandé de vous connecter avec votre compte Twitch, pour ajouter le bot à vos VIPs (nécessaire pour son fonctionnement), ainsi qu'ajouter votre chaîne. **Aucune information personnelle ni aucun accès à votre compte n'est conservé.**
- Pour se connecter à une nouvelle chaine, l'ensemble du bot doit redémarrer. Jusqu'au **4 octobre à 15h**, chaque ajout de chaîne déclenche un redémarrage.
- Afin de limiter l'impact sur les autres participant·es, passée cette date, celui-ci n'est redémarré qu'une fois par jour, à 2h du matin. **Merci de faire le nécessaire pour réaliser a minima cette première partie du tutoriel en amont.**

## Liste des commandes
| **Commande** | **Description**                                                           |
|:-------------|:--------------------------------------------------------------------------|
| `!album`     | Lien vers le site d'achat de l'album composé par Résonances.              |
| `!asso`      | Texte descriptif de l'association pour laquelle les fonds sont récoltés.  |
| `!clip`      | Call to action : "Faîtes des clips !".                                    |
| `!config`    | **Modérateur·ices et propriétaire de la chaine uniquement**, cf ci-après. |
| `!don`       | Lien vers votre page de dons.                                             |
| `!event`     | Texte descriptif de l'événement ETC.                                      |
| `!goals`     | Lien vers vos donations goals (le cas échéant).                           |
| `!planning`  | Lien vers votre planning.                                                 |
| `!tshirt`    | Lien vers la boutique.                                                    |

## Configuration
Pour configurer vos commandes selon vos lien, utilisez `!config <clef> <valeur>`.

| Clef         | Type de valeur | Description                                                                                                  |
|--------------|:--------------:|--------------------------------------------------------------------------------------------------------------|
| `slc`        |     `url`      | Lien de votre cagnotte personnelle (trouvable dans Streamlabs Charity)                                       |
| `goals`      |     `url`      | Lien de vos donations goals (le cas échéant)                                                                 |
| `prog`       |     `url`      | Lien de votre planning de stream pour le WE (le cas échéant)                                                 |
| `intervalle` |    `entier`    | Intervalle (en minute) entre chaque message automatique du chatbot *(5min par défaut)*                       |
| `limite`     |    `entier`    | Limite de message du chat en dessous de laquelle le message automatique ne sera pas envoyé *(20 par défaut)* |

- `url` : Adresse complète, avec `https://`
