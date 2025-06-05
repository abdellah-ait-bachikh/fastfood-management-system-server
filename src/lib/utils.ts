import { NextFunction, Request, Response } from "express";
import { AsyncFunction } from "./types";

export const isError = (error: unknown): error is Error =>
  error instanceof Error &&
  typeof error == "object" &&
  typeof (error as Error).message === "string";

export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next).catch(next));
  };
};
