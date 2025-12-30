/**
 * Supertest is used for full HTTP-level integration testing.
 * These tests hit the real Express app and real MongoDB.
 */
const request = require("supertest");

/**
 * Express application instance.
 */
const app = require("../../app");

/**
 * Test payload for creating a todo.
 */
const newTodo = require("../mock-data/new-todo.json");

/**
 * MongoDB connection utilities for test environment.
 */
const mongodb = require("../../mongodb/mongodb.connect");

/**
 * Base endpoint under test.
 */
const endPointUrl = "/todos/";

let newTodoId;
let server;
let firstTodo;

/**
 * Setup before running integration tests.
 * Starts DB connection and HTTP server.
 */
beforeAll(async () => {
  await mongodb.connect();
  server = app.listen();
});

/**
 * Cleanup after all tests finish.
 * Prevents open handles and memory leaks.
 */
afterAll(async () => {
  await server.close();
  await mongodb.disconnect();
});

describe(endPointUrl, () => {

    test(`POST ${endPointUrl}`, async () => {
    const response = await request(server)
      .post(endPointUrl)
      .send(newTodo);

    // Ensures resource creation status
    expect(response.statusCode).toBe(201);

    // Ensures response follows API contract
    expect(response.body).toHaveProperty("data");

    // Ensures created todo matches input
    expect(response.body.data.title).toBe(newTodo.title);
    expect(response.body.data.status).toBe(newTodo.status);

    // Store ID for update/delete tests
    newTodoId = response.body.data._id;
  });

  test(`POST ${endPointUrl} (invalid payload)`, async () => {
    const response = await request(server)
      .post(endPointUrl)
      .send({ title: "Status is missing" });

    // Ensures server correctly rejects invalid payload
    expect(response.statusCode).toBe(500);

    // Ensures error message is returned
    expect(response.body).toHaveProperty("message");
  });
  
  test(`GET ${endPointUrl}`, async () => {
    const response = await request(server).get(endPointUrl);

    // Ensures successful HTTP response
    expect(response.statusCode).toBe(200);

    // Ensures API returns an object (not string/null)
    expect(typeof response.body).toBe("object");

    // Ensures response follows API contract
    expect(response.body).toHaveProperty("data");

    // Ensures data is an array
    expect(Array.isArray(response.body.data)).toBeTruthy();

    // Ensures at least one todo exists
    expect(response.body.data.length).toBeGreaterThan(0);

    // Ensures required fields exist on todo object
    expect(response.body.data[0].title).toBeDefined();
    expect(response.body.data[0].status).toBeDefined();

    // Store first todo for later tests
    firstTodo = response.body.data[0];
  });

  test(`GET ${endPointUrl}:id`, async () => {
    const response = await request(server).get(
      `${endPointUrl}${firstTodo._id}`
    );

    // Ensures successful fetch
    expect(response.statusCode).toBe(200);

    // Ensures response is an object
    expect(typeof response.body).toBe("object");

    // Ensures correct response shape
    expect(response.body).toHaveProperty("data");

    // Ensures fetched todo matches original
    expect(response.body.data.title).toStrictEqual(firstTodo.title);
    expect(response.body.data.status).toStrictEqual(firstTodo.status);
  });

  test(`GET ${endPointUrl}:id (not found)`, async () => {
    const response = await request(server).get(
      `${endPointUrl}695166189f60cdc6632aa4a6`
    );

    // Ensures correct REST behavior for missing resource
    expect(response.statusCode).toBe(404);

    // Ensures consistent error response
    expect(response.body).toStrictEqual({
      message: "Todo not found",
      data: {},
    });
  });



  test(`PUT ${endPointUrl}:id`, async () => {
    const response = await request(server)
      .put(`${endPointUrl}${newTodoId}`)
      .send(newTodo);

    // Ensures successful update
    expect(response.statusCode).toBe(200);

    // Ensures response contains updated data
    expect(response.body).toHaveProperty("data");

    // Ensures updated fields are correct
    expect(response.body.data.title).toBe(newTodo.title);
    expect(response.body.data.status).toBe(newTodo.status);
  });

  test(`DELETE ${endPointUrl}:id`, async () => {
    const response = await request(server)
      .delete(`${endPointUrl}${newTodoId}`);

    // 200 is used because API returns message + data
    expect(response.statusCode).toBe(200);

    // Ensures deletion confirmation response
    expect(response.body).toStrictEqual({
      message: "Todo deleted successfully",
      data: {},
    });
  });
});
