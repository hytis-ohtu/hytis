FROM ubuntu:latest
WORKDIR /usr/local/app

# Install the application dependencies
# Depends on language WIP

# Copy in the source code
COPY . .
# Expose port WIP
EXPOSE 8090 

# Setup an app user so the container doesn't run as the root user
RUN useradd app
USER app
