import { Schema, model, type HydratedDocument, type Model } from "mongoose";

export type UserRole = "admin" | "customer";
export type UserStatus = "active" | "blocked";

export interface User {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  refreshTokenHash?: string | null;
  lastLoginAt?: Date | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type UserModel = Model<User>;
export type UserDocument = HydratedDocument<User>;

const userSchema = new Schema<User, UserModel>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "customer"], default: "customer", index: true },
    status: { type: String, enum: ["active", "blocked"], default: "active", index: true },
    refreshTokenHash: { type: String, default: null, select: false },
    lastLoginAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_document, returnedObject) => {
        Reflect.deleteProperty(returnedObject, "password");
        Reflect.deleteProperty(returnedObject, "refreshTokenHash");
        return returnedObject;
      },
    },
  },
);

export const UserModel = model<User, UserModel>("User", userSchema);
