# Serveur des collections et duels en ligne (online/), pour un hébergeur qui construit une image Docker.
# Le HTTPS est fait par l'hébergeur (BEHIND_PROXY=1) ; la base et ses sauvegardes vont dans le volume /data.
# Guide : online/DEPLOIEMENT.md
FROM node:24-slim
WORKDIR /app
COPY engine/package.json engine/package-lock.json engine/
RUN npm --prefix engine ci
COPY engine engine
COPY online online
COPY ygo/ui/web ygo/ui/web
COPY static/engine/libocgcore.wasm static/engine/sql-wasm-browser.wasm static/engine/
# données du moteur (scripts des cartes sous GPL-2.0, base de cartes, listes des interdites), puis le serveur compilé
RUN node engine/fetch-data.cjs && node engine/build-online.cjs
ENV HOST=0.0.0.0 PORT=8600 BEHIND_PROXY=1 ONLINE_DB=/data/online.sqlite BACKUP_DIR=/data/sauvegardes NODE_ENV=production
EXPOSE 8600
VOLUME /data
CMD ["node", "online/server/out.cjs"]
