FROM node:20-alpine
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN mkdir input
RUN npm ci
COPY . .
RUN npm run dist
ENV NODE_ENV="production"
EXPOSE 3042
USER node
CMD [ "node", "--max-old-space-size=16384", "dist/app.js" ]