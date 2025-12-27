const ToDoController = require('../../controllers/todo.controller');
const TodoModel = require('../../models/todo.models');
const httpMocks = require('node-mocks-http');
const newTodo = require('../mock-data/new-todo.json')

TodoModel.create = jest.fn();


let req, res, next;

beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
});

describe("ToDoController.createToDo", () => {
  beforeEach(() => {
    req.body = newTodo;
  });

  it("Should have a create todo function", () => {
    expect(typeof ToDoController.createToDo).toBe("function");
  });

  it("Should call ToDoModel.create method", async () => {
    await ToDoController.createToDo(req, res, next);
    expect(TodoModel.create).toHaveBeenCalledWith(newTodo)
  });

  it('Should return 201 response code', async () => {
    await ToDoController.createToDo(req, res, next);
    expect(res.statusCode).toBe(201);
    expect(res._isEndCalled()).toBeTruthy()
  });

  it('Should return json response', async () => {
    TodoModel.create.mockReturnValue(newTodo);
    await ToDoController.createToDo(req, res, next);
    expect(res._getJSONData()).toStrictEqual(newTodo)
  });

  it('Should handle errors', async  () => {
    const errorMessage = {
      message: "Status is missing!"
    };

    const rejectedPromise = Promise.reject(errorMessage);
    TodoModel.create.mockReturnValue(rejectedPromise)

    await ToDoController.createToDo(req, res, next);
    expect(next).toHaveBeenCalledWith(errorMessage)
  });

});
