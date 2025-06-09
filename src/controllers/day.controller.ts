import { Request, Response } from "express";
import { asyncHandler } from "../lib/utils";
import { db } from "../lib/db";

export const getLastDay = asyncHandler(async (req: Request, res: Response) => {
  const lastDay = await db.day.findFirst({
    where: { stopAt: null },
    orderBy: {
      startAt: "desc",
    },
  });

  if (!lastDay) {
    res.status(200).json({ day: null });
    return;
  }

  res.status(200).json({ day: lastDay });
});

export const createDay = asyncHandler(async (req: Request, res: Response) => {
  const lastDay = await db.day.findFirst({
    where: { stopAt: null },
  });
  if (lastDay) {
    res.status(400).json({ message: "Une journée est déjà en cours" });
    return;
  }
  const newDay = await db.day.create({
    data: {
      startAt: new Date(),
    },
    include: {
      paymentsOffers: true,
      paymentsProducts: true,
      _count: {
        select: {
          paymentsOffers: true,
          paymentsProducts: true,
        },
      },
    },
  });
  const { paymentsProducts, paymentsOffers, ...rest } = newDay;
  const totalPaymentsProductsMoney = paymentsProducts.reduce(
    (sum, paymentProduct) => sum + (paymentProduct.totalePrice || 0),
    0
  );
  const totalPaymentsOffersMoney = paymentsOffers.reduce(
    (sum, offer) => sum + (offer.totalePrice || 0),
    0
  );
  const totalDeleverysProductsMoney = paymentsProducts.reduce(
    (sum, paymentProduct) => sum + (paymentProduct.delevryPrice || 0),
    0
  );
  const totalDeleverysOffersMoney = paymentsOffers.reduce(
    (sum, paymentOffer) => sum + (paymentOffer.delevryPrice || 0),
    0
  );
  const rsult = {
    ...rest,
    totalPaymentsMoney: totalPaymentsProductsMoney + totalPaymentsOffersMoney,
    totalDeleveryMoney: totalDeleverysProductsMoney + totalDeleverysOffersMoney,
  };
  res.status(201).json({ message: "Journée démarrée avec succès", day: rsult });
});

export const stopDay = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const dayId = parseInt(id);
  if (isNaN(dayId)) {
    res.status(400).json({ message: "ID invalide" });
    return;
  }

  const existingDay = await db.day.findUnique({
    where: { id: dayId },
  });

  if (!existingDay) {
    res.status(404).json({ message: "Journée introuvable" });
    return;
  }

  if (existingDay.stopAt) {
    res.status(400).json({ message: "La journée est déjà arrêtée" });
    return;
  }

  const updatedDay = await db.day.update({
    where: { id: dayId },
    data: { stopAt: new Date() },
    include: {
      paymentsOffers: true,
      paymentsProducts: true,
      _count: {
        select: {
          paymentsOffers: true,
          paymentsProducts: true,
        },
      },
    },
  });
  const { paymentsProducts, paymentsOffers, ...rest } = updatedDay;
  const totalPaymentsProductsMoney = paymentsProducts.reduce(
    (sum, paymentProduct) => sum + (paymentProduct.totalePrice || 0),
    0
  );
  const totalPaymentsOffersMoney = paymentsOffers.reduce(
    (sum, offer) => sum + (offer.totalePrice || 0),
    0
  );
  const totalDeleverysProductsMoney = paymentsProducts.reduce(
    (sum, paymentProduct) => sum + (paymentProduct.delevryPrice || 0),
    0
  );
  const totalDeleverysOffersMoney = paymentsOffers.reduce(
    (sum, paymentOffer) => sum + (paymentOffer.delevryPrice || 0),
    0
  );
  const rsult = {
    ...rest,
    totalPaymentsMoney: totalPaymentsProductsMoney + totalPaymentsOffersMoney,
    totalDeleveryMoney: totalDeleverysProductsMoney + totalDeleverysOffersMoney,
  };
  res.status(200).json({ message: "Journée arrêtée avec succès", day: rsult });
});

export const getDaysWithPaymentsCount = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, rowsPerPage = "all", dateFilter = undefined } = req.query;
    let from: Date | undefined;
    let to: Date | undefined;

    if (dateFilter && !isNaN(new Date(dateFilter as string).getTime())) {
      const parseDate = new Date(dateFilter as string);
      from = new Date(
        parseDate.getFullYear(),
        parseDate.getMonth(),
        parseDate.getDate()
      );
      to = new Date(
        parseDate.getFullYear(),
        parseDate.getMonth(),
        parseDate.getDate() + 1
      );
    }

    const take = rowsPerPage
      ? isNaN(parseInt(rowsPerPage as string))
        ? undefined
        : parseInt(rowsPerPage as string)
      : undefined; //rows per page
    const cureentPage = !isNaN(parseInt(page as string))
      ? parseInt(page as string)
      : 1;
    const skip = take ? (cureentPage - 1) * take : undefined;

    const totalResult = await db.day.count();
    const totalFilterResult = await db.day.count({
      where: from ? { startAt: { gte: from, lt: to } } : undefined,
    });
    const days = await db.day.findMany({
      where: from ? { startAt: { gte: from, lt: to } } : undefined,
      skip,
      take,
      include: {
        paymentsOffers: true,
        paymentsProducts: true,
        _count: {
          select: {
            paymentsOffers: true,
            paymentsProducts: true,
          },
        },
      },
      orderBy: {
        startAt: "desc",
      },
    });
    const formatedResult = days.map((day) => {
      const { paymentsOffers, paymentsProducts, ...rest } = day;
      const totalPaymentsProductsMoney = paymentsProducts.reduce(
        (sum, paymentProduct) => sum + (paymentProduct.totalePrice || 0),
        0
      );
      const totalPaymentsOffersMoney = paymentsOffers.reduce(
        (sum, offer) => sum + (offer.totalePrice || 0),
        0
      );
      const totalDeleverysProductsMoney = paymentsProducts.reduce(
        (sum, paymentProduct) => sum + (paymentProduct.delevryPrice || 0),
        0
      );
      const totalDeleverysOffersMoney = paymentsOffers.reduce(
        (sum, paymentOffer) => sum + (paymentOffer.delevryPrice || 0),
        0
      );
      return {
        ...rest,
        totalPaymentsMoney:
          totalPaymentsProductsMoney + totalPaymentsOffersMoney,
        totalDeleveryMoney:
          totalDeleverysProductsMoney + totalDeleverysOffersMoney,
      };
    });
    res.json({
      days: formatedResult,
      pagination: {
        page: cureentPage,
        rowsPerPage: take ?? totalFilterResult,
        totalPages: take ? Math.ceil(totalFilterResult / take) : 1,
        totalResult,
        totalFilterResult,
      },
    });
  }
);

export const deleteDay = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (isNaN(parseInt(id))) {
    res.status(400).json({ message: "ID invalide" });
    return;
  }
  const existDay = await db.day.findUnique({
    where: { id: parseInt(id) },
  });
  if (!existDay) {
    res.status(404).json({ message: "Journée introuvable" });
    return;
  }
  await db.day.delete({
    where: { id: parseInt(id) },
  });
  res.status(200).json({message:'Journée suprimer avec success'})
});
