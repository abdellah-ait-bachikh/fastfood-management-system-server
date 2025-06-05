import { Request, Response } from "express";
import { asyncHandler } from "../lib/utils";
import { db } from "../lib/db";

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const totlProductPaymentsPrice = await db.paymentProduct.aggregate({
    _sum: {
      totalePrice: true,
    },
  });
  const totalOfferPaymentsPrice = await db.paymentOffer.aggregate({
    _sum: {
      totalePrice: true,
    },
  });

  const ProductsPaymentsCount = await db.paymentProduct.count({
    where: { isPayed: true },
  });
  const offersPaymentsCount = await db.paymentOffer.count({
    where: { isPayed: true },
  });

  const totaleProductsDelevryPrice = await db.paymentProduct.aggregate({
    _sum: {
      delevryPrice: true,
    },
    where: {
      delevryPrice: { not: null },
    },
  });
  const totaleOffersDeleveryPrice = await db.paymentOffer.aggregate({
    _sum: {
      delevryPrice: true,
    },
    where: {
      delevryPrice: { not: null },
    },
  });
  const dayCounts = await db.day.count();
  const result = {
    totalPrice:
      (totalOfferPaymentsPrice._sum.totalePrice ?? 0) +
      (totlProductPaymentsPrice._sum.totalePrice ?? 0),
    totalDeleveryPrice:
      (totaleProductsDelevryPrice._sum.delevryPrice ?? 0) +
      (totaleOffersDeleveryPrice._sum.delevryPrice ?? 0),
    ordersCount: ProductsPaymentsCount + offersPaymentsCount,
    dayCounts,
  };
  res.status(200).json(result);
});
