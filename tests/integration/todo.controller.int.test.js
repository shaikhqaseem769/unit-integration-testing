const request = require("supertest");
const app = require("../../app");
const newTodo = require("../mock-data/new-todo.json");
const mongodb = require('../../mongodb/mongodb.connect');

const endPointUrl = '/todos/';


let server;

beforeAll(async () => {
  await mongodb.connect();
  server = app.listen();
});

afterAll(async () => {
  await server.close();
  await mongodb.disconnect();
});

describe(endPointUrl, () => {
    it(`POST ${endPointUrl}`, async () => {
        const response = await request(server)
            .post(endPointUrl)
            .send(newTodo);
        
        expect(response.statusCode).toBe(201)
        expect(response.body.title).toBe(newTodo.title)
        expect(response.body.status).toBe(newTodo.status)
    })
})