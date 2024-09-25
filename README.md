# EtTonBot

Chatbot Twitch à destination des streameur·euses de l'événement caritatif Et Ta Cause.

## Prérequis
S'enregistrer grâce à [ce lien](https://amesul.tv/streamers/register). Il sera demandé de vous connecter avec votre compte Twitch pour ajouter le bot à vos VIPs (nécessaire pour son fonctionnement), ainsi qu'à votre chaîne. **Aucune information personnelle ni aucun accès à votre compte n'est conservé.**

- Pour se connecter à une nouvelle chaîne, l'ensemble du bot doit redémarrer. Jusqu'au **4 octobre à 15h**, chaque ajout de chaîne déclenche un redémarrage.
- Afin de limiter l'impact sur les autres participant·es, passée cette date, le bot ne sera redémarré qu'une fois par jour, à 3h du matin. **Merci de faire le nécessaire pour réaliser au minimum cette première partie du tutoriel en amont.**

## Liste des commandes
| **Commande** | **Description**                                                            |
|:-------------|:---------------------------------------------------------------------------|
| `!album`     | Lien vers le site d'achat de l'album composé par Résonances.               |
| `!asso`      | Texte descriptif de l'association pour laquelle les fonds sont récoltés.   |
| `!clip`      | Call to action : "Faites des clips !"                                      |
| `!config`    | **Modérateurs·ices et propriétaire de la chaîne uniquement**, cf ci-après. |
| `!don`       | Lien vers votre page de dons.                                              |
| `!event`     | Texte descriptif de l'événement ETC.                                       |
| `!goals`     | Lien vers vos donations goals (le cas échéant).                            |
| `!planning`  | Lien vers votre planning.                                                  |
| `!tshirt`    | Lien vers la boutique.                                                     |

## Configuration
Pour configurer vos commandes selon vos liens, utilisez `!config <clef> <valeur>`.

| Clef         | Type de valeur | Description                                                                                                        |
|--------------|:--------------:|--------------------------------------------------------------------------------------------------------------------|
| `slc`        |     `url`      | Lien de votre cagnotte personnelle (trouvable dans Streamlabs Charity)                                             |
| `goals`      |     `url`      | Lien de vos donations goals (le cas échéant)                                                                       |
| `prog`       |     `url`      | Lien de votre planning de stream pour le WE (le cas échéant)                                                       |
| `intervalle` |    `entier`    | Intervalle (en minutes) entre chaque message automatique du chatbot *(5 min par défaut)*                           |
| `limite`     |    `entier`    | Limite de messages dans le chat en dessous de laquelle le message automatique ne sera pas envoyé *(20 par défaut)* |

- `url` : Adresse complète, incluant `https://`

## Support
Pour toute question ou problème, n'hésitez pas à contacter l'équipe Tech, et plus particulièrement Amesul pour obtenir de l'aide !

## Remerciements
Merci à vous pour votre engagement et votre soutien !