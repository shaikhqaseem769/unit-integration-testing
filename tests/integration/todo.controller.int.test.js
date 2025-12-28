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

	test(`GET ${endPointUrl}`, async () => {
		const response = await request(server).get(endPointUrl);
		
		expect(response.statusCode).toBe(200);
		expect(typeof response.body).toBe("object");
		expect(Array.isArray(response.body)).toBeTruthy();
		expect(response.body[0].title).toBeDefined();
		expect(response.body[0].status).toBeDefined();

	});

    it(`POST ${endPointUrl}`, async () => {
        const response = await request(server)
            .post(endPointUrl)
            .send(newTodo);
        
        expect(response.statusCode).toBe(201)
        expect(response.body.title).toBe(newTodo.title)
        expect(response.body.status).toBe(newTodo.status)
    });

    it(`should return status code 500 on malform data with POST ${endPointUrl}`, async () => {
      const response = await request(server)
      .post(endPointUrl)
      .send({title: 'Status is missing'});
      
      expect(response.statusCode).toBe(500);

      expect(response.body).toStrictEqual({message: 'Todo validation failed: status: Path `status` is required.'})
    })
})