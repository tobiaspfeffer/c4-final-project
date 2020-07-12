import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { todoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const ToDoData = new todoAccess()

export async function getToDos(userId: string): Promise<TodoItem[]> {
    return ToDoData.getToDos(userId)
}

export async function createToDo(
  createTodoRequest: CreateTodoRequest, userId: string ): Promise<TodoItem> {

  const itemId: string = uuid.v4()
  let dateTime: string = new Date().toLocaleString()

  const newToDo = {
    userId: userId,
    todoId: itemId,
    createdAt: dateTime,
    done: false,
    ...createTodoRequest
  }
  return await ToDoData.createToDos(newToDo)
}

export async function deleteToDo(
    userId: string, todoId: string): Promise<TodoItem> {
    return await ToDoData.deleteToDos(userId, todoId)
  }

export async function updateToDo(
    todoupdate: UpdateTodoRequest, userId: string, todoId: string): Promise<TodoItem> {
    return await ToDoData.updateToDos(todoupdate as TodoUpdate, userId, todoId)
  }