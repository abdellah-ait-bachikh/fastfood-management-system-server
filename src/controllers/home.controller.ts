import { Request, Response } from "express";
import { asyncHandler } from "../lib/utils";
import { db } from "../lib/db";

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const yearParam = req.query.year as string | undefined;

  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

  const startYearDate = new Date(year, 0, 1);
  const endYearDate = new Date(year + 1, 0, 1);
  const totlProductPaymentsPrice = await db.paymentProduct.aggregate({
    _sum: {
      totalePrice: true,
    },
    where: {
      createdAt: { gte: startYearDate, lt: endYearDate },
    },
  });
  const totalOfferPaymentsPrice = await db.paymentOffer.aggregate({
    _sum: {
      totalePrice: true,
    },
    where: {
      createdAt: { gte: startYearDate, lt: endYearDate },
    },
  });

  const ProductsPaymentsCount = await db.paymentProduct.count({
    where: {
      isPayed: true,
      createdAt: { gte: startYearDate, lt: endYearDate },
    },
  });
  const offersPaymentsCount = await db.paymentOffer.count({
    where: {
      isPayed: true,
      createdAt: { gte: startYearDate, lt: endYearDate },
    },
  });

  const totaleProductsDelevryPrice = await db.paymentProduct.aggregate({
    _sum: {
      delevryPrice: true,
    },
    where: {
      delevryPrice: { not: null },
      createdAt: { gte: startYearDate, lt: endYearDate },
    },
  });
  const totaleOffersDeleveryPrice = await db.paymentOffer.aggregate({
    _sum: {
      delevryPrice: true,
    },
    where: {
      delevryPrice: { not: null },
      createdAt: { gte: startYearDate, lt: endYearDate },
    },
  });
  const dayCounts = await db.day.count({
    where: { startAt: { gte: startYearDate, lt: endYearDate } },
  });
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
    const yearParam = req.query.year as string | undefined;
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
    const startYearDate = new Date(year, 0, 1);
    const endYearDate = new Date(year + 1, 0, 1);

    const topProductsbyQuantity = await db.paymentProductDetail.groupBy({
      by: ["productId"],
      _sum: { quantity: true, totalePrice: true },
      orderBy: {
        _sum: { quantity: "desc" },
      },
      where: {
        createdAt: { gte: startYearDate, lt: endYearDate },
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
    const yearParam = req.query.year as string | undefined;
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
    const startYearDate = new Date(year, 0, 1);
    const endYearDate = new Date(year + 1, 0, 1);

    const topPopularOffers = await db.paymentOfferDetail.groupBy({
      by: ["offerId"],
      _sum: { totalePrice: true, quantity: true },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      where: {
        createdAt: { gte: startYearDate, lt: endYearDate },
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
    const yearParam = req.query.year as string | undefined;
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
    const startYearDate = new Date(year, 0, 1);
    const endYearDate = new Date(year + 1, 0, 1);

    const deleverys = await db.user.findMany({
      where: {
        role: "livreur",
        createdAt: { gte: startYearDate, lt: endYearDate },
      },
      select: {
        id: true,
        userName: true,
      },
    });
    const deleverysWithTotaleMoney = await Promise.all(
      deleverys.map(async (item) => {
        const delevryWithTotaleMoneyPaymentsProducts =
          await db.paymentProduct.aggregate({
            where: {
              delevryId: item.id,
              createdAt: { gte: startYearDate, lt: endYearDate },
            },
            _sum: {
              delevryPrice: true,
            },
          });
        const delevryWithTotaleMoneyPaymentsOffers =
          await db.paymentOffer.aggregate({
            where: {
              delevryId: item.id,
              createdAt: { gte: startYearDate, lt: endYearDate },
            },
            _sum: {
              delevryPrice: true,
            },
          });
        const totalePaymentsProducts = await db.paymentProduct.count({
          where: {
            delevryId: item.id,
            createdAt: { gte: startYearDate, lt: endYearDate },
          },
        });
        const totalePaymentsOffers = await db.paymentOffer.count({
          where: {
            delevryId: item.id,
            createdAt: { gte: startYearDate, lt: endYearDate },
          },
        });
        return {
          ...item,
          totalMoney:
            (delevryWithTotaleMoneyPaymentsProducts._sum.delevryPrice ?? 0) +
            (delevryWithTotaleMoneyPaymentsOffers._sum.delevryPrice ?? 0),
          paymentsCount: totalePaymentsProducts + totalePaymentsOffers,
        };
      })
    );
    res.status(200).json(deleverysWithTotaleMoney);
  }
);

export const getMonthlyYearStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const yearParam = req.query.year as string | undefined;

    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    const startYearDate = new Date(year, 0, 1);
    const endYearDate = new Date(year + 1, 0, 1);

    const [paymentsProducts, paymentsOffers] = await Promise.all([
      db.paymentProduct.findMany({
        where: {
          isPayed: true,
          createdAt: {
            gte: startYearDate,
            lt: endYearDate,
          },
        },
      }),
      db.paymentOffer.findMany({
        where: {
          isPayed: true,
          createdAt: {
            gte: startYearDate,
            lt: endYearDate,
          },
        },
        select: {
          totalePrice: true,
          createdAt: true,
        },
      }),
    ]);

    const monthlyStatus = Array.from({ length: 12 }, (_, i) => ({
      month: 0,
      paymentsCount: 0,
      totalMoney: 0,
    }));
    const allPayments = [...paymentsProducts, ...paymentsOffers];
    for (const payment of allPayments) {
      const month = new Date(payment.createdAt).getMonth();
      monthlyStatus[month].totalMoney += Number(payment.totalePrice || 0);
      monthlyStatus[month].paymentsCount += 1;
    }
    const result = monthlyStatus.map((item, index) => ({
      month: index,
      paymentsCount: item.paymentsCount,
      totalMoney: item.totalMoney,
    }));
    res.status(200).json(result);
  }
);

export const getYearsList = asyncHandler(
  async (req: Request, res: Response) => {
    const days = await db.day.findMany({ select: { startAt: true } });

    const yearsSet = new Set(
      days.map((item) => new Date(item.startAt).getFullYear())
    );
    const result = Array.from(yearsSet).sort((a, b) => a - b);
    res.status(200).json(result);
  }
);
