FROM node:20-alpine
ARG DATABASE_URL,SECRET

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY . .

RUN pnpm install --prod=false

RUN DATABASE_URL=$DATABASE_URL npx prisma generate
RUN DATABASE_URL=$DATABASE_URL pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "start"]