import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { AppError } from "../../utils/AppError.js";
import { UserModel } from "../users/user.model.js";
import { loginSchema } from "./auth.schemas.js";
import {
  clearAuthCookies,
  createAccessToken,
  createRefreshToken,
  hashToken,
  setAuthCookies,
  verifyRefreshToken,
} from "./auth.tokens.js";

function publicUser(user: { id: string; name: string; email: string; role: string; status: string }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status };
}

export async function login(request: Request, response: Response): Promise<void> {
  const credentials = loginSchema.parse(request.body);
  const user = await UserModel.findOne({ email: credentials.email, deletedAt: null }).select(
    "+password +refreshTokenHash",
  );

  if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
    throw new AppError("Email hoặc mật khẩu không đúng.", 401, "INVALID_CREDENTIALS");
  }
  if (user.status !== "active") {
    throw new AppError("Tài khoản đã bị khóa.", 403, "ACCOUNT_BLOCKED");
  }
  if (user.role !== "admin") {
    throw new AppError("Tài khoản không có quyền truy cập trang quản trị.", 403, "ADMIN_ONLY");
  }

  const accessToken = createAccessToken(user.id, user.role);
  const refreshToken = createRefreshToken(user.id, user.role);
  user.refreshTokenHash = hashToken(refreshToken);
  user.lastLoginAt = new Date();
  await user.save();
  setAuthCookies(response, accessToken, refreshToken);

  response.json({ success: true, data: { user: publicUser(user) } });
}

export async function refresh(request: Request, response: Response): Promise<void> {
  const token = request.cookies?.refreshToken as string | undefined;
  if (!token) {
    throw new AppError("Không tìm thấy phiên đăng nhập.", 401, "NO_REFRESH_TOKEN");
  }

  const payload = verifyRefreshToken(token);
  const user = await UserModel.findOne({ _id: payload.sub, deletedAt: null }).select(
    "+refreshTokenHash",
  );
  if (!user || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(token)) {
    throw new AppError("Phiên đăng nhập không hợp lệ.", 401, "INVALID_SESSION");
  }
  if (user.status !== "active" || user.role !== "admin") {
    throw new AppError("Tài khoản không thể truy cập trang quản trị.", 403, "ADMIN_ONLY");
  }

  const accessToken = createAccessToken(user.id, user.role);
  const refreshToken = createRefreshToken(user.id, user.role);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  setAuthCookies(response, accessToken, refreshToken);
  response.json({ success: true, data: { user: publicUser(user) } });
}

export async function logout(request: Request, response: Response): Promise<void> {
  const token = request.cookies?.refreshToken as string | undefined;
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      await UserModel.findByIdAndUpdate(payload.sub, { $unset: { refreshTokenHash: 1 } });
    } catch {
      // An invalid cookie should not prevent the user from logging out locally.
    }
  }
  clearAuthCookies(response);
  response.json({ success: true, data: null });
}

export async function me(request: Request, response: Response): Promise<void> {
  const user = await UserModel.findOne({ _id: request.auth?.userId, deletedAt: null });
  if (!user || user.status !== "active") {
    throw new AppError("Không tìm thấy tài khoản đang đăng nhập.", 401, "USER_NOT_FOUND");
  }
  response.json({ success: true, data: { user: publicUser(user) } });
}
