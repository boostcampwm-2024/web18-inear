FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY client/ client/

RUN corepack enable && \
    yarn install

WORKDIR /app/client

EXPOSE 5173
CMD ["yarn", "run", "dev", "--no-open", "--host"]
