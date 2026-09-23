import type { Request, Response } from "express";
import mongoose from "mongoose";

export async function getDashboardSummary(_request: Request, response: Response): Promise<void> {
  const database = mongoose.connection.db;
  if (!database) {
    throw new Error("Database is not connected");
  }

  const [products, orders, customers, lowStock, revenueResult] = await Promise.all([
    database.collection("products").countDocuments({ deletedAt: null }),
    database.collection("orders").countDocuments({}),
    database.collection("users").countDocuments({ role: "customer", deletedAt: null }),
    database
      .collection("products")
      .aggregate<{ total: number }>([
        { $match: { status: "active", deletedAt: null } },
        { $project: { totalStock: { $sum: "$variants.stock" } } },
        { $match: { totalStock: { $lte: 5 } } },
        { $count: "total" },
      ])
      .toArray(),
    database
      .collection("orders")
      .aggregate<{ total: number }>([
        { $match: { status: "delivered", paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ])
      .toArray(),
  ]);

  response.json({
    success: true,
    data: {
      products,
      orders,
      customers,
      lowStock: lowStock[0]?.total ?? 0,
      revenue: revenueResult[0]?.total ?? 0,
    },
  });
}
