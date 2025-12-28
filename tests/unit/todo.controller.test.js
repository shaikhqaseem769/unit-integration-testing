const ToDoController = require('../../controllers/todo.controller');
const TodoModel = require('../../models/todo.models');
const httpMocks = require('node-mocks-http');
const newTodo = require('../mock-data/new-todo.json')
const allTodos = require('../mock-data/all-todos.json')
TodoModel.create = jest.fn();
TodoModel.find = jest.fn();


let req, res, next;

beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
});

describe('ToDocontroller.getToDos', () => {
  it('should have a geToDos function', () => {
    expect(typeof ToDoController.getToDos).toBe("function")
  });

  it("should calll TodoModel.find({})", async () => {
    await ToDoController.getToDos(req, res, next);
    expect(TodoModel.find).toHaveBeenCalledWith({})
  });

  it('should return 200 status code and all todos', async() => {
    TodoModel.find.mockReturnValue(allTodos)
    await ToDoController.getToDos(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(res._isEndCalled()).toBeTruthy();
    expect(res._getJSONData()).toStrictEqual(allTodos)
  })

  it('sould handled errors in get all todos', async () => {
    const errorMessage = {message: 'Error in finding todos'};
    const rejectedPromise = Promise.reject(errorMessage);
    TodoModel.find.mockReturnValue(rejectedPromise);
    await ToDoController.getToDos(req, res, next);
    // expect(res.statusCode).toBe(500);
    expect(next).toHaveBeenCalledWith(errorMessage)
  })
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
