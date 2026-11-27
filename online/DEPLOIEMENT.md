# Mettre le serveur en ligne

Le serveur des collections et des duels (`online/`) tourne aujourd'hui sur ton PC. Ce guide explique comment le
rendre accessible depuis internet. **Le compte chez l'hébergeur, c'est toi qui le crées** : aucun mot de passe ni
moyen de paiement ne passe par ce projet.

## Ce dont le serveur a besoin

- **Node.js 24** et environ 300 Mo de mémoire : le moteur de règles tourne en WebAssembly, une partie à la fois par duel.
- **Un disque persistant** pour la base (`/data/online.sqlite`) : identités, collections, decks, amis, historique.
  Sans disque persistant, tout est perdu à chaque redémarrage.
- **Le HTTPS** : obligatoire dès que le serveur est sur internet. Les hébergeurs le fournissent ; le serveur doit
  alors être lancé avec `BEHIND_PROXY=1` (déjà réglé dans le `Dockerfile`).
- **Une seule instance** : les duels en cours vivent dans la mémoire du serveur.

Le `Dockerfile` à la racine du dépôt construit tout : il télécharge les données du moteur (`engine/fetch-data.cjs`)
et compile le serveur. Il n'embarque ni ta collection, ni `data/`, ni l'Excel.

## Variables

| Variable | Rôle | Valeur dans l'image |
| --- | --- | --- |
| `PORT` | port d'écoute | `8600` |
| `HOST` | adresse d'écoute | `0.0.0.0` |
| `BEHIND_PROXY` | `1` : l'hébergeur fait le HTTPS et donne l'adresse du visiteur | `1` |
| `ONLINE_DB` | fichier de la base | `/data/online.sqlite` |
| `BACKUP_DIR` | sauvegardes (au démarrage puis chaque jour, 14 gardées) ; vide = aucune | `/data/sauvegardes` |
| `TLS_CERT`, `TLS_KEY` | certificat, si le serveur fait lui-même le HTTPS (sur un VPS sans proxy) | — |

## Exemple : Fly.io

Fly.io construit le `Dockerfile` et fournit HTTPS et disque persistant (volume).

1. Crée ton compte sur fly.io et installe l'outil `flyctl`.
2. Depuis le dossier du projet :
   ```
   fly launch --no-deploy        (choisis un nom, une région proche, refuse les bases proposées)
   fly volumes create donnees --size 1
   ```
3. Dans le `fly.toml` créé, monte le volume et indique le port :
   ```
   [mounts]
     source = "donnees"
     destination = "/data"

   [http_service]
     internal_port = 8600
     force_https = true
     auto_stop_machines = "off"
     min_machines_running = 1
   ```
4. `fly deploy`, puis ouvre l'adresse `https://<nom>.fly.dev`.

Render, Railway ou un VPS conviennent aussi : il faut un service « Docker », un disque monté sur `/data` et le port 8600.

## Relier l'appli de ton PC

Dans l'appli Streamlit, page **Partage en ligne** : remplace l'adresse du serveur par `https://<nom>.fly.dev`, puis
colle la clé affichée sur la page **Mon compte** du site en ligne (ton pseudo créé sur ton PC n'existe pas là-bas,
la base est neuve).

## Sauvegardes

Le serveur copie la base chaque jour dans `/data/sauvegardes` (`base-AAAA-MM-JJ.sqlite`). Pour en récupérer une sur
ton PC avec Fly.io : `fly ssh sftp get /data/sauvegardes/base-AAAA-MM-JJ.sqlite`. Pour restaurer, arrête le serveur
et remplace `/data/online.sqlite` par la sauvegarde.

## Mettre à jour

Après un `git pull` : `fly deploy`. Les données du moteur (scripts des cartes, listes des interdites) sont
retéléchargées à chaque construction : les nouvelles cartes et la nouvelle liste arrivent ainsi.

## Licences

La page `/a-propos` du site donne les licences. Les scripts des cartes (ygopro-scripts) sont sous GPL-2.0 : le
serveur les utilise sans modification et renvoie vers leur source.
