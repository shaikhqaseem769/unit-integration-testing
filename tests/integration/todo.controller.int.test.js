const request = require("supertest");
const app = require("../../app");
const newTodo = require("../mock-data/new-todo.json");
const mongodb = require('../../mongodb/mongodb.connect');

const endPointUrl = '/todos/';


let server;
let firstTodo;
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
    firstTodo = response.body[0];


	});

  test(`Get todo by id ${endPointUrl}:id`, async () => {
    const response = (await request(server).get(`${endPointUrl}${firstTodo._id}`));
    expect(response.statusCode).toBe(200);
    expect(typeof response.body).toBe("object");
    expect(response.body.title).toStrictEqual(firstTodo.title)
    expect(response.body.status).toStrictEqual(firstTodo.status)
  });

  test(`Get todo by id doesn't exist ${endPointUrl}:id`, async () => {
    const response = await request(server).get(`${endPointUrl}695166189f60cdc6632aa4a6`);
    expect(response.statusCode).toBe(404);
    
  })

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