
# AgroControl SaaS Backend

## Instalar
npm install

## Banco
npx prisma generate
npx prisma migrate dev --name init

## Rodar
npm run dev

## Endpoints
POST /auth/register
POST /auth/login
GET /farms (auth)
POST /farms (auth)
