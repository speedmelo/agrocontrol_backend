
import bcrypt from 'bcrypt'
import { prisma } from '../prisma.js'

export default async function (app) {

  app.post('/register', async (req) => {
    const { name, email, password } = req.body
    const hash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hash }
    })

    return { id: user.id }
  })

  app.post('/login', async (req, res) => {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) return res.code(400).send({ error: 'Usuário não encontrado' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.code(400).send({ error: 'Senha inválida' })

    const token = app.jwt.sign({ id: user.id })
    return { token }
  })
}
