import bcrypt from "bcryptjs";
import { Types, type SortOrder } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { UserModel, type User, type UserRole, type UserStatus } from "./user.model.js";
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from "./users.schemas.js";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializeUser(user: {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function assertValidId(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Mã người dùng không hợp lệ.", 400, "INVALID_USER_ID");
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === 11000);
}

async function assertNotRemovingLastAdmin(user: User, nextRole?: UserRole, nextStatus?: UserStatus) {
  const removesActiveAdmin =
    user.role === "admin" &&
    user.status === "active" &&
    (nextRole === "customer" || nextStatus === "blocked");

  if (!removesActiveAdmin) return;

  const activeAdmins = await UserModel.countDocuments({
    role: "admin",
    status: "active",
    deletedAt: null,
  });
  if (activeAdmins <= 1) {
    throw new AppError(
      "Hệ thống phải còn ít nhất một quản trị viên đang hoạt động.",
      409,
      "LAST_ACTIVE_ADMIN",
    );
  }
}

export async function listUsers(query: ListUsersQuery) {
  const filter: {
    deletedAt: null;
    role?: UserRole;
    status?: UserStatus;
    $or?: Array<{ name: RegExp } | { email: RegExp }>;
  } = { deletedAt: null };

  if (query.role !== "all") filter.role = query.role;
  if (query.status !== "all") filter.status = query.status;
  if (query.search) {
    const expression = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [{ name: expression }, { email: expression }];
  }

  const sortMap: Record<ListUsersQuery["sort"], Record<string, SortOrder>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    name_asc: { name: 1 },
    name_desc: { name: -1 },
  };
  const skip = (query.page - 1) * query.limit;

  const [users, filteredTotal, total, customers, admins, active, blocked] = await Promise.all([
    UserModel.find(filter)
      .select("name email role status lastLoginAt createdAt updatedAt")
      .sort(sortMap[query.sort])
      .skip(skip)
      .limit(query.limit)
      .lean(),
    UserModel.countDocuments(filter),
    UserModel.countDocuments({ deletedAt: null }),
    UserModel.countDocuments({ role: "customer", deletedAt: null }),
    UserModel.countDocuments({ role: "admin", deletedAt: null }),
    UserModel.countDocuments({ status: "active", deletedAt: null }),
    UserModel.countDocuments({ status: "blocked", deletedAt: null }),
  ]);

  return {
    users: users.map(serializeUser),
    pagination: {
      page: query.page,
      limit: query.limit,
      total: filteredTotal,
      totalPages: Math.max(1, Math.ceil(filteredTotal / query.limit)),
    },
    summary: { total, customers, admins, active, blocked },
  };
}

export async function getUserById(userId: string) {
  assertValidId(userId);
  const user = await UserModel.findOne({ _id: userId, deletedAt: null })
    .select("name email role status lastLoginAt createdAt updatedAt")
    .lean();
  if (!user) throw new AppError("Không tìm thấy người dùng.", 404, "USER_NOT_FOUND");
  return serializeUser(user);
}

export async function createUser(input: CreateUserInput) {
  try {
    const user = await UserModel.create({
      name: input.name,
      email: input.email,
      password: await bcrypt.hash(input.password, 12),
      role: input.role,
      status: input.status,
    });
    return serializeUser(user);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError("Email này đã được sử dụng.", 409, "EMAIL_ALREADY_EXISTS");
    }
    throw error;
  }
}

export async function updateUser(userId: string, currentAdminId: string, input: UpdateUserInput) {
  assertValidId(userId);
  const user = await UserModel.findOne({ _id: userId, deletedAt: null }).select("+refreshTokenHash");
  if (!user) throw new AppError("Không tìm thấy người dùng.", 404, "USER_NOT_FOUND");

  const isSelf = user.id === currentAdminId;
  if (isSelf && (input.role !== undefined || input.status !== undefined)) {
    throw new AppError(
      "Bạn không thể tự thay đổi vai trò hoặc trạng thái của chính mình.",
      409,
      "SELF_PROTECTION",
    );
  }

  await assertNotRemovingLastAdmin(user, input.role, input.status);

  if (input.name !== undefined) user.name = input.name;
  if (input.email !== undefined) user.email = input.email;
  if (input.role !== undefined) user.role = input.role;
  if (input.status !== undefined) user.status = input.status;
  if (input.status === "blocked" || input.role === "customer") user.refreshTokenHash = null;

  try {
    await user.save();
    return serializeUser(user);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError("Email này đã được sử dụng.", 409, "EMAIL_ALREADY_EXISTS");
    }
    throw error;
  }
}

export async function updateUserStatus(
  userId: string,
  currentAdminId: string,
  status: UserStatus,
) {
  return updateUser(userId, currentAdminId, { status });
}

export async function deleteUser(userId: string, currentAdminId: string) {
  assertValidId(userId);
  if (userId === currentAdminId) {
    throw new AppError("Bạn không thể xóa tài khoản đang đăng nhập.", 409, "SELF_PROTECTION");
  }

  const user = await UserModel.findOne({ _id: userId, deletedAt: null }).select("+refreshTokenHash");
  if (!user) throw new AppError("Không tìm thấy người dùng.", 404, "USER_NOT_FOUND");
  await assertNotRemovingLastAdmin(user, "customer", "blocked");

  user.status = "blocked";
  user.deletedAt = new Date();
  user.refreshTokenHash = null;
  await user.save();
}
