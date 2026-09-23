import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../modules/auth/auth.tokens.js";
import { UserModel, type UserRole } from "../modules/users/user.model.js";

export const authenticate: RequestHandler = async (request, _response, next) => {
  const token = request.cookies?.accessToken as string | undefined;
  if (!token) {
    next(new AppError("Bạn chưa đăng nhập.", 401, "UNAUTHENTICATED"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await UserModel.findOne({
      _id: payload.sub,
      status: "active",
      deletedAt: null,
    })
      .select("role")
      .lean();

    if (!user || user.role !== payload.role) {
      next(new AppError("Tài khoản không còn quyền truy cập.", 401, "ACCOUNT_ACCESS_CHANGED"));
      return;
    }

    request.auth = { userId: payload.sub, role: user.role };
    next();
  } catch (error) {
    next(error);
  }
};

export function authorize(...roles: UserRole[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.auth || !roles.includes(request.auth.role)) {
      next(new AppError("Bạn không có quyền thực hiện thao tác này.", 403, "FORBIDDEN"));
      return;
    }
    next();
  };
}
