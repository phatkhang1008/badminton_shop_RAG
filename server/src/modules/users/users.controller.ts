import type { Request, Response } from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  updateUser,
  updateUserStatus,
} from "./users.service.js";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
  updateUserStatusSchema,
} from "./users.schemas.js";

function getRouteParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function currentAdminId(request: Request): string {
  return request.auth?.userId ?? "";
}

export async function getUsers(request: Request, response: Response): Promise<void> {
  const result = await listUsers(listUsersQuerySchema.parse(request.query));
  response.json({ success: true, data: result });
}

export async function getUser(request: Request, response: Response): Promise<void> {
  const user = await getUserById(getRouteParam(request.params.userId));
  response.json({ success: true, data: { user } });
}

export async function postUser(request: Request, response: Response): Promise<void> {
  const user = await createUser(createUserSchema.parse(request.body));
  response.status(201).json({ success: true, data: { user } });
}

export async function patchUser(request: Request, response: Response): Promise<void> {
  const user = await updateUser(
    getRouteParam(request.params.userId),
    currentAdminId(request),
    updateUserSchema.parse(request.body),
  );
  response.json({ success: true, data: { user } });
}

export async function patchUserStatus(request: Request, response: Response): Promise<void> {
  const { status } = updateUserStatusSchema.parse(request.body);
  const user = await updateUserStatus(
    getRouteParam(request.params.userId),
    currentAdminId(request),
    status,
  );
  response.json({ success: true, data: { user } });
}

export async function removeUser(request: Request, response: Response): Promise<void> {
  await deleteUser(getRouteParam(request.params.userId), currentAdminId(request));
  response.json({ success: true, data: null });
}
