import { NextFunction, Request, Response } from "express";
import { isError } from "../lib/utils";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Unexpected Server Error: ", err);
  if (isError(err)) {
    res.status(500).json({
      message: `Erreur interne du serveur | ${err.message}`,
    });
  } else {
    res.status(500).json({
      message: "Erreur inconnue du serveur",
    });
  }
};
