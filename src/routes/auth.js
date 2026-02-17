import bcrypt from 'bcrypt'
import { prisma } from '../prisma.js'

export default async function (app) {

  // ✅ REGISTER: agora exige phone, email opcional
  app.post('/register', async (req, res) => {
    const { name, phone, email, password } = req.body

    if (!name || !phone || !password) {
      return res.code(400).send({ error: 'name, phone e password são obrigatórios' })
    }

    const cleanPhone = String(phone).replace(/\D/g, '') // só números

    if (cleanPhone.length < 10 || cleanPhone.length > 13) {
      return res.code(400).send({ error: 'phone inválido. Use DDD + número (ex: 11999998888)' })
    }

    const emailNorm = email ? String(email).trim().toLowerCase() : null

    // verifica duplicado por phone e/ou email
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          ...(emailNorm ? [{ email: emailNorm }] : [])
        ]
      }
    })

    if (existing) {
      return res.code(409).send({ error: 'Usuário já existe (phone/email já cadastrado)' })
    }

    const hash = await bcrypt.hash(String(password), 10)

    const user = await prisma.user.create({
      data: {
        name,
        phone: cleanPhone,
        email: emailNorm,
        password: hash
      }
    })

    return { id: user.id }
  })


  // ✅ LOGIN: aceita login por phone OU email
  app.post('/login', async (req, res) => {
    const { login, password } = req.body

    if (!login || !password) {
      return res.code(400).send({ error: 'login e password são obrigatórios' })
    }

    const loginStr = String(login).trim()
    const isEmail = loginStr.includes('@')
    const cleanPhone = loginStr.replace(/\D/g, '')

    const user = await prisma.user.findFirst({
      where: isEmail ? { email: loginStr.toLowerCase() } : { phone: cleanPhone }
    })

    if (!user) return res.code(400).send({ error: 'Usuário não encontrado' })

    const ok = await bcrypt.compare(String(password), user.password)

    // ✅ BUGFIX: aqui era o inverso no seu código
    if (!ok) return res.code(400).send({ error: 'Senha inválida' })

    const token = app.jwt.sign({ id: user.id })
    return { token }
  })
}
