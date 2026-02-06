#FROM node:alpine
#
#WORKDIR /usr/src/app/backend
#
#COPY package*.json ./
#
#RUN npm ci
#
#COPY . .
#
#EXPOSE 3000
#RUN npm run tsc
#
FROM node:25
WORKDIR /usr/src/app/backend

# Install the application dependencies
COPY package* ./
RUN npm ci
# Copy in the source code
COPY . .

RUN chmod -R 777 *
ENV NODE_ENV=production
ENV DATABASE_URL='postgresql://neondb_owner:npg_XpTUAvmjn1C4@ep-shiny-field-agupt0rb-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

RUN npm run tsc

# Expose port WIP
EXPOSE 3000
#CMD ["node", "build/src/index.js"]
CMD [ "npm",  "run", "start"]

#alla oleva buildaa imagen, toimii vain toukon käyttäjällä (ehkä)
# docker build frontend/ -t l0uko/sijoittaja-frontend

#runnin pitäisi toimia kaikilla
# docker run -t -p 4173:4173 l0uko/sijoittaja-frontend:latest 
