import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import userObj from "../model/dbusers";
import functionsObj from "../library/functions";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization");
  try {
    if (!token) return res.json(functionsObj.output(401, "Access denied"));

    const userId: any = jwt.verify(token, process.env.JWT_TOKEN!);

    const user = await userObj.findUserWithId(+userId.userId);
    if (user) {
      req.body.user = user;
      next();
    } else {
      throw new Error("User not found");
    }
  } catch (err: any) {
    console.log(err);
    res.status(401).json(functionsObj.output(0, err.message));
  }
};

export default authenticate;
