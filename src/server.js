
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import dotenv from 'dotenv'

dotenv.config()

const app = Fastify({ logger: true })

app.register(cors)
app.register(jwt, { secret: process.env.JWT_SECRET })

app.decorate("auth", async (req, res) => {
  try {
    await req.jwtVerify()
  } catch {
    res.code(401).send({ error: "Não autorizado" })
  }
})

app.register(import('./routes/auth.js'), { prefix: '/auth' })
app.register(import('./routes/farms.js'), { prefix: '/farms' })

app.get('/', () => ({ ok: true, name: "AgroControl API" }))
app.get('/', () => ({ ok: true, name: "AgroControl API" }))
app.get('/me', { preHandler: [app.auth] }, async (req) => {
  return { user: req.user }
})
app.listen({ port: process.env.PORT, host: '0.0.0.0' })
