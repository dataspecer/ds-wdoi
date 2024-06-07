FROM node:20-alpine
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN mkdir input
RUN npm ci
COPY . .
RUN npm run dist
ENV NODE_ENV="production"
USER node
CMD [ "node", "dist/app.js" ]