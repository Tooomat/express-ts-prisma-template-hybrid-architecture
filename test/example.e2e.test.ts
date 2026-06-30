import supertest from "supertest"
import * as server from "../src/infrastructure/server"
import { winstonLogger } from "../src/infrastructure/logging"

describe('POST /api/example', () => {
    it('should reject new user if request is invalid', async () => {
        const res = await supertest(server.webApp)
        .post("/api/example")
        .send({
            username: "",
            password: "",
            name: ""
        })

        winstonLogger.debug(res.body)
        expect(res.status).toBe(400)
        expect(res.body.errors).toBeDefined()
    })
})