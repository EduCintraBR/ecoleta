import { Request, Response } from 'express'
import knex from '../database/connection'

class ItemsController {
    async index(req: Request, res: Response) {
        const items = await knex('items').select('*')
    
        const serializedItems = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                //SERVIDOR RODANDO NA WEB USAR LOCALHOST
                //image_url: `http://localhost:3333/uploads/${item.image}`

                //SERVIDOR PARA RODAR NO MOBILE TROCAR PARA IP
                image_url: `http://192.168.0.137:3333/uploads/${item.image}`
            }
        })
    
        return res.json(serializedItems)
    }
}

export default ItemsController