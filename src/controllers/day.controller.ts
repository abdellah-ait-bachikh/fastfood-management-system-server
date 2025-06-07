import { Request, Response } from "express";
import { asyncHandler } from "../lib/utils";
import { db } from "../lib/db";



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
  });
  res
    .status(201)
    .json({ message: "Journée démarrée avec succès", day: newDay });
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
  });

  res
    .status(200)
    .json({ message: "Journée arrêtée avec succès", day: updatedDay });
});
