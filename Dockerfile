FROM node

# Timezone Stuff
RUN apt-get install -y tzdata
ENV TZ Europe/Berlin

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

#TAEFIK CONFIG
LABEL traefik.enable="true" \
      traefik.http.routers.esnr-api.entrypoints="websecure" \
      traefik.http.routers.esnr-api.rule="Host(`eat-sleep-nintendo-repeat.eu`) && PathPrefix(`/api`)" \
      traefik.http.middlewares.esnr-api-stripprefix.stripprefix.prefixes="/api" \
      traefik.http.routers.esnr-api.middlewares="esnr-api-stripprefix" \
      traefik.port="7869" \
      traefik.http.routers.esnr-api.tls.certresolver="letsencrypt"

EXPOSE 7869
CMD [ "node", "index.js" ]
