FROM node:alpine
WORKDIR /usr/src/app

# Install the application dependencies
# Depends on language WIP

# Copy in the source code
# Expose port WIP
EXPOSE 4173 
COPY package.json ./
RUN npm ci
COPY . .

# Setup an app user so the container doesn't run as the root user
#RUN useradd app
#USER app
RUN npm run build
CMD [ "npm", "run", "preview"]
