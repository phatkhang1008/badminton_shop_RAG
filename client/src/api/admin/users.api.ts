import { http } from "../core/http";

export type UserStatus = "active" | "blocked";
export type UserRole = "admin" | "customer";
export type UserSort = "newest" | "oldest" | "name_asc" | "name_desc";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserListParams {
  page: number;
  limit: number;
  search: string;
  status: "all" | UserStatus;
  role: "all" | UserRole;
  sort: UserSort;
}

export interface UserListResult {
  users: ManagedUser[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  summary: {
    total: number;
    customers: number;
    admins: number;
    active: number;
    blocked: number;
  };
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
}

export type UpdateUserInput = Omit<Partial<CreateUserInput>, "password">;

export async function getUsers(params: UserListParams): Promise<UserListResult> {
  const response = await http.get<{ success: true; data: UserListResult }>("/admin/users", {
    params,
  });
  return response.data.data;
}

export async function getUser(userId: string): Promise<ManagedUser> {
  const response = await http.get<{ success: true; data: { user: ManagedUser } }>(
    `/admin/users/${userId}`,
  );
  return response.data.data.user;
}

export async function createUser(input: CreateUserInput): Promise<ManagedUser> {
  const response = await http.post<{ success: true; data: { user: ManagedUser } }>(
    "/admin/users",
    input,
  );
  return response.data.data.user;
}

export async function updateUser(userId: string, input: UpdateUserInput): Promise<ManagedUser> {
  const response = await http.patch<{ success: true; data: { user: ManagedUser } }>(
    `/admin/users/${userId}`,
    input,
  );
  return response.data.data.user;
}

export async function updateUserStatus(
  userId: string,
  status: UserStatus,
): Promise<ManagedUser> {
  const response = await http.patch<{ success: true; data: { user: ManagedUser } }>(
    `/admin/users/${userId}/status`,
    { status },
  );
  return response.data.data.user;
}

export async function deleteUser(userId: string): Promise<void> {
  await http.delete(`/admin/users/${userId}`);
}
