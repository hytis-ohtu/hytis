FROM node:25
WORKDIR /usr/src/app

# Install the application dependencies
COPY . .
RUN npm run install:all
# Copy in the source code

RUN chmod -R 777 *
ENV NODE_ENV=production
ENV DATABASE_URL='postgresql://neondb_owner:npg_XpTUAvmjn1C4@ep-shiny-field-agupt0rb-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

#RUN npm run tsc
RUN npm run build:frontend
RUN npm run build:backend
RUN mkdir build && cp -r frontend/dist build/
# Expose port WIP
EXPOSE 3000
CMD ["node", "backend/build/src/index.js"]
#CMD [ "/bin/bash"]

