FROM node:20-alpine
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN mkdir input
RUN npm ci
COPY . .
RUN npm run dist
ENV ES_CERT_PATH="/app/input/http_ca.crt"
ENV CLASSES_PATH="/app/input/classes.json"
ENV PROPERTIES_PATH="/app/input/properties.json"
ENV NODE_ENV="production"
EXPOSE 3042
USER node
CMD [ "node", "--max-old-space-size=16384", "dist/app.js" ]