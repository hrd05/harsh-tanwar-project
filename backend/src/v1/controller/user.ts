import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as geolib from "geolib";
import {
  signupSchema,
  loginSchema,
  addressSchema,
  validateRequest,
  fareSchema,
  riderSchema,
  deliveryIdSchema,
} from "../helpers/validation_schema";
import userObj from "../model/dbusers";
import functionsObj from "../library/functions";
import pickupAddObj from "../model/dbpickup_address";
import deliveryAddObj from "../model/dbdelivery_address";
import deliveryObj from "../model/dbdeliveries";
import riderObj from "../model/dbriders";

export class userController {
  public postSignup = async (req: Request, res: Response) => {
    try {
      const value = await validateRequest(req, signupSchema);
      const hashed_pass = await bcrypt.hash(value.password, 10);

      const result = await userObj.insertUser(
        value.name,
        value.email,
        value.phone,
        hashed_pass
      );
      if (result) {
        res.json(functionsObj.output(1, "signup success"));
      }
    } catch (err: any) {
      if (err.isJoi) {
        return res
          .status(422)
          .json(functionsObj.output(0, err.details[0].message));
      }
      if (err.code === "23505") {
        return res.status(409).json(functionsObj.output(0, err.detail));
      } else {
        return res
          .status(500)
          .json(functionsObj.output(0, "Internal server error"));
      }
    }
  };

  public generateAccessToken = (id: any) => {
    return jwt.sign({ userId: id }, process.env.JWT_TOKEN!);
  };

  //****LOGIN_API*****//

  public postLogin = async (req: Request, res: Response) => {
    try {
      const value = await validateRequest(req, loginSchema);
      const user = await userObj.findUser(value.email);
      if (!user) {
        res.status(404).json(functionsObj.output(0, "user not found"));
      } else {
        const result = await bcrypt.compare(value.password, user.password);
        if (result) {
          const token = this.generateAccessToken(user.id);
          const { password, ...userWithoutPassword } = user;
          res.json(
            functionsObj.output(1, "login success", {
              token: token,
              user: userWithoutPassword,
            })
          );
        } else {
          res.status(401).json(functionsObj.output(0, "Wrong password"));
        }
      }
    } catch (err: any) {
      console.log(err);
      if (err.isJoi) {
        return res
          .status(422)
          .json(functionsObj.output(0, err.details[0].message));
      }
      res.status(500).json(functionsObj.output(0, err.message));
    }
  };

  //******ADDING_PICKUP_ADDRESS*******//

  public addPickupAddress = async (req: Request, res: Response) => {
    try {
      const value = await validateRequest(req, addressSchema);
      const { address, latitude, longitude } = value;
      const user_id = req.body.user.id;
      const result = await pickupAddObj.insertPickupAddress(
        user_id,
        address,
        +latitude,
        +longitude
      );
      res.json(functionsObj.output(1, "pickup address added"));
    } catch (err: any) {
      console.log(err);
      if (err.isJoi) {
        return res
          .status(422)
          .json(functionsObj.output(0, err.details[0].message));
      }
      res.json(functionsObj.output(0, err.message));
    }
  };

  //******GET_USER_SAVED_PICKUP_ADDRESS*******//

  public getPickupAddress = async (req: Request, res: Response) => {
    const user_id = req.body.user.id;
    try {
      const result = await pickupAddObj.getPickupAddress(user_id);

      if (result.length === 0) {
        res.status(200).json(functionsObj.output(1, "No address found"));
      }

      if (result.length > 0) {
        res.json(
          functionsObj.output(1, "fetching pickup_address success", result)
        );
      }
    } catch (err: any) {
      res.status(500).json(functionsObj.output(0, err.message));
    }
  };

  //******ADD_USER_DELIVERY_ADDRESS******//

  public addDeliveryAddress = async (req: Request, res: Response) => {
    const user_id = req.body.user.id;
    try {
      const value = await validateRequest(req, addressSchema);
      const { address, latitude, longitude } = value;
      const result = await deliveryAddObj.insertDeliveryAddress(
        user_id,
        address,
        +latitude,
        +longitude
      );
      res.json(functionsObj.output(1, "delivery address added"));
    } catch (err: any) {
      console.log(err);
      res.json(functionsObj.output(0, err.message));
    }
  };

  //******GET_USER_SAVED_DELIVERY_ADDRESS********//

  public getDeliveryAddress = async (req: Request, res: Response) => {
    const user_id = req.body.user.id;
    try {
      const result = await deliveryAddObj.getDeliveryAddress(user_id);

      if (result.length === 0) {
        res.status(200).json(functionsObj.output(1, "No address found"));
      }

      if (result.length > 0) {
        res.json(
          functionsObj.output(1, "fetching delivery_address success", result)
        );
      }
    } catch (err: any) {
      res.json(functionsObj.output(0, err.message));
    }
  };

  //*******CALCAULTE_FARE_FOR_THE_DELIVERY **********//

  public calculateFare = async (req: Request, res: Response) => {
    const { pickup_pos, delivery_pos } = req.body;

    try {
      // const pickup_address_id = req.params.pickupId;
      // const delivery_address_id = req.params.deliveryId;

      // if (!pickup_address_id || !delivery_address_id) {
      //   res.status(404).json(functionsObj.output(0, "Missing ids"));
      // }
      // const pickupLocation = await pickupAddObj.getCoordinateWithId(
      //   +pickup_address_id
      // );
      // const deliveryLocation = await deliveryAddObj.getCoordinateWithId(
      //   +delivery_address_id
      // );
      console.log(pickup_pos, delivery_pos);
      const delivery_dist: number = this.calculateDistance(
        pickup_pos,
        delivery_pos
      );

      const fare: number = this.getFare(delivery_dist / 1000);

      res.status(200).json(
        functionsObj.output(1, "calcaulating distance success", {
          dist_in_km: delivery_dist / 1000,
          dist_in_m: delivery_dist,
          fare: fare,
        })
      );
    } catch (err: any) {
      console.log(err);
      res.json(functionsObj.output(0, err.message));
    }
  };

  public calculateDistance = (origin: any, destination: any): number => {
    const dist = geolib.getDistance(origin, destination, 1);
    return dist;
  };

  public getFare = (dist: number): number => {
    const price_per_km_general = 10;
    const price_per_km_near = 15;
    let fare;

    if (dist < 3) {
      fare = price_per_km_near * dist;
    } else {
      fare = price_per_km_general * dist;
    }

    return Math.round(fare);
  };

  //********GET_USER_BOOKED_DELIVERIES********/

  public getUserDeliveries = async (req: Request, res: Response) => {
    try {
      const user_id = req.body.user.id;
      const deliveries = await deliveryObj.findUserDeliveries(user_id);
      res.json(functionsObj.output(1, "Success", deliveries));
    } catch (err: any) {
      console.log(err);
      res.json(functionsObj.output(0, err.message));
    }
  };

  //********TRACK_LOCATION_OF_DELIVERY/RIDER*******/

  public trackDelivery = async (req: Request, res: Response) => {
    const rider_id = req.params.rider_id;
    try {
      if (!rider_id) {
        throw new Error("rider id required");
      }

      // take rider id and track since we are tracking rider
      // send rider location lat and long to user

      const rider = await riderObj.getRiderLocation(+rider_id);

      res.json(functionsObj.output(1, "success", rider));
    } catch (err: any) {
      console.log(err);
      res.json(functionsObj.output(0, err.message));
    }
  };

  //********USER_CANCELING_DELIVERY*********/

  public cancelDelivery = async (req: Request, res: Response) => {
    const { delivery_id } = await validateRequest(req, deliveryIdSchema);
    const user_id = req.body.user.id;
    console.log(delivery_id);

    try {
      const delivery = await deliveryObj.getDeliveryWithId(delivery_id);

      if (!delivery) {
        throw new Error("Delivery not found");
      }

      if (delivery.user_id !== user_id) {
        throw new Error("Unauthorised action");
      }

      await deliveryObj.updateDelivery(delivery_id, {
        delivery_status: "cancelled",
        rider_id: null,
      });

      if (delivery.rider_id) {
        await riderObj.updateRider(delivery.rider_id, { available: true });
      }

      res.json(functionsObj.output(1, "Delivery cancelled successfully"));
    } catch (err: any) {
      console.log(err);
      res.json(functionsObj.output(0, err.message));
    }
  };
}
