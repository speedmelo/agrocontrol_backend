
import { prisma } from '../prisma.js'

export default async function (app) {

  app.addHook('onRequest', app.auth)

  app.get('/', async (req) => {
    return prisma.farm.findMany({
      where: { ownerId: req.user.id }
    })
  })

  app.post('/', async (req) => {
    const { name } = req.body
    return prisma.farm.create({
      data: { name, ownerId: req.user.id }
    })
  })
}
