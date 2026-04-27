FROM node:25-alpine AS backend-build

WORKDIR /usr/src/app

COPY /backend/package*.json ./
RUN npm ci

COPY /backend .

RUN npm run build


FROM node:25-alpine AS frontend-build

WORKDIR /usr/src/app

COPY /frontend/package*.json ./
RUN npm ci

COPY /frontend .

RUN npm run build


FROM node:25-alpine
WORKDIR /usr/src/app

COPY --from=backend-build /usr/src/app/package*.json ./
COPY --from=backend-build /usr/src/app/build ./build
COPY --from=frontend-build /usr/src/app/dist ./build/dist

RUN npm ci --omit=dev && \
    npm cache clean --force && \
    addgroup -g 1001 -S appuser && \
    adduser -S -u 1001 -G appuser appuser

USER appuser

EXPOSE 3000
CMD ["node", "build/src/index.js"]

