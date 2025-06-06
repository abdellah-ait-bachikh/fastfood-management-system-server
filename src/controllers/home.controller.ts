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
    totaleMoney:
      (totalOfferPaymentsPrice._sum.totalePrice ?? 0) +
      (totlProductPaymentsPrice._sum.totalePrice ?? 0),
    totalDeleveryMoney:
      (totaleProductsDelevryPrice._sum.delevryPrice ?? 0) +
      (totaleOffersDeleveryPrice._sum.delevryPrice ?? 0),
    ordersCount: ProductsPaymentsCount + offersPaymentsCount,
    dayCounts,
  };
  res.status(200).json(result);
});

export const getPopularProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const topProductsbyQuantity = await db.paymentProductDetail.groupBy({
      by: ["productId"],
      _sum: { quantity: true, totalePrice: true },
      orderBy: {
        _sum: { quantity: "desc" },
      },
    });
    const filteredProducts = topProductsbyQuantity.filter(
      (item) => item._sum.quantity && item._sum.quantity > 0
    );
    const result = await Promise.all(
      filteredProducts.map(async (item) => {
        const product = await db.product.findUnique({
          where: { id: item.productId },
          select: {
            name: true,
            category: {
              select: {
                name: true,
                imageUri: true,
              },
            },
          },
        });
        if (!product) {
          return null;
        } else {
          return {
            id: item.productId,
            ...product,
            quantity: item._sum.quantity,
            totalMoney: item._sum.totalePrice,
          };
        }
      })
    );

    res.status(200).json(result.filter(Boolean));
  }
);

export const getPopularOffers = asyncHandler(
  async (req: Request, res: Response) => {
    const topPopularOffers = await db.paymentOfferDetail.groupBy({
      by: ["offerId"],
      _sum: { totalePrice: true, quantity: true },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
    });
    const filtredOffers = topPopularOffers.filter(
      (item) => item._sum.quantity && item._sum.quantity > 0
    );
    const result = await Promise.all(
      filtredOffers.map(async (item) => {
        const offer = await db.offer.findUnique({
          where: {
            id: item.offerId,
          },
          select: {
            name: true,
            imageUri: true,
          },
        });
        if (!offer) {
          return null;
        } else {
          return {
            id: item.offerId,
            ...offer,
            quantity: item._sum.quantity,
            totalMoney: item._sum.totalePrice,
          };
        }
      })
    );
    res.status(200).json(result.filter(Boolean));
  }
);

export const getTopRankingDelevery = asyncHandler(
  async (req: Request, res: Response) => {
    const deleverys = await db.user.findMany({
      where: { role: "livreur" },
      select: {
        id: true,
        userName: true,
      },
    });
    const deleverysWithTotaleMoney = await Promise.all(
      deleverys.map(async (item) => {
        const delevryWithTotaleMoneyPaymentsProducts =
          await db.paymentProduct.aggregate({
            where: { delevryId: item.id },
            _sum: {
              delevryPrice: true,
            },
          });
        const delevryWithTotaleMoneyPaymentsOffers =
          await db.paymentOffer.aggregate({
            where: {
              delevryId: item.id,
            },
            _sum: {
              delevryPrice: true,
            },
          });
        const totalePaymentsProducts = await db.paymentProduct.count({
          where: {
            delevryId: item.id,
          },
        });
        const totalePaymentsOffers = await db.paymentOffer.count({
          where: {
            delevryId: item.id,
          },
        });
        return {
          ...item,
          totalMoeny:
            (delevryWithTotaleMoneyPaymentsProducts._sum.delevryPrice ?? 0) +
            (delevryWithTotaleMoneyPaymentsOffers._sum.delevryPrice ?? 0),
          totalePayments: totalePaymentsProducts + totalePaymentsOffers,
        };
      })
    );
    res.status(200).json(deleverysWithTotaleMoney);
  }
);
