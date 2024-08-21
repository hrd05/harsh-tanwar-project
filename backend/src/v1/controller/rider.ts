import * as geolib from "geolib";
import riderObj from "../model/dbriders";
import deliveryObj from "../model/dbdeliveries";
import { Request, Response } from "express";
import functionsObj from "../library/functions";
import {
  validateRequest,
  riderSchema,
  riderAndLocatioSchema,
  riderAndDeliverySchema,
} from "../helpers/validation_schema";
import { func, valid } from "joi";
import userObj from "../model/dbusers";

export class riderController {
  public async getDeliveryDetail(req: Request, res: Response) {
    const { rider_id } = await validateRequest(req, riderSchema);

    try {
      const delivery_data: any = await deliveryObj.getDeliveryWithRiderId(
        rider_id
      );

      if (!delivery_data) {
        res.status(404).json(functionsObj.output(0, "no deliveries found"));
      }

      const user_data = await userObj.findUserWithId(delivery_data.user_id);

      res.json(functionsObj.output(1, "success", { user_data, delivery_data }));
    } catch (err: any) {
      console.log(err);
      res.json(functionsObj.output(0, err.message));
    }
  }

  //*****UPDATING_LOCATION_OF_RIDER******//

  public async updateLocation(req: Request, res: Response) {
    const { rider_id, latitude, longitude } = await validateRequest(
      req,
      riderAndLocatioSchema
    );

    try {
      if (!rider_id || !longitude || !latitude) {
        throw new Error("Invalid data");
      }

      const result = await riderObj.updateRider(rider_id, {
        latitude,
        longitude,
      });
      console.log(result);

      if (!result) {
        throw new Error("Error upating the location");
      }

      return res.json(functionsObj.output(1, "Location of rider updated"));
    } catch (err: any) {
      console.log(err);
      if (err.isJoi) {
        return res
          .status(422)
          .json(functionsObj.output(0, err.details[0].message));
      }
      res.json(functionsObj.output(0, err.message));
    }
  }

  public async cancelAndAssignNewRider(req: Request, res: Response) {
    const { rider_id, delivery_id } = await validateRequest(
      req,
      riderAndDeliverySchema
    );

    try {
      const delivery_data = await deliveryObj.getDeliveryWithId(delivery_id);

      if (delivery_data.rider_id !== rider_id) {
        throw new Error("Delivery not assigned to this rider id");
      }

      const pickup_point = {
        latitude: delivery_data.pickup_latitude,
        longitude: delivery_data.pickup_longitude,
      };

      const riders = await riderObj.getAvailableRiders();
      if (!riders) {
        throw new Error("No available rider found");
      }

      const nearestRider: any = geolib.findNearest(pickup_point, riders);

      if (!nearestRider) {
        throw new Error("No nearest rider found");
      }

      //   delivery_data.rider_id = nearestRider.id;

      await deliveryObj.updateDelivery(delivery_id, {
        rider_id: nearestRider.id,
      });

      await riderObj.updateRider(delivery_data.rider_id, {
        available: false,
      });

      await riderObj.updateRider(rider_id, { available: true });

      res.json(
        functionsObj.output(1, "success", { rider_detail: nearestRider })
      );
    } catch (err: any) {
      console.log(err);
      if (err.isJoi) {
        return res
          .status(422)
          .json(functionsObj.output(0, err.details[0].message));
      }
      res.json(functionsObj.output(0, err.message));
    }
  }

  //*****RIDER_UPDATING_THE_STATUS_OF_DELIVERY******//

  public async updateStatusOfDelivery(req: Request, res: Response) {
    const { status } = req.body;
    if (!status) {
      throw new Error("status missing");
    }
    const delivery_id = req.params.deliveryid;
    try {
      const response = await deliveryObj.updateDelivery(+delivery_id, {
        delivery_status: status,
      });

      res.json(functionsObj.output(1, "Status updated"));
    } catch (err: any) {
      console.log(err);
      res.json(functionsObj.output(0, err.message));
    }
  }

  public async getRiderDetail(req: Request, res: Response) {
    const rider_id = req.params.rider_id;
    try {
      if (!rider_id) {
        res.json(functionsObj.output(0, "rider id missing in params"));
      }
      const rider = await riderObj.riderDetail(+rider_id);
      if (rider) {
        res.json(functionsObj.output(1, "Rider Info fetched", rider));
      } else {
        throw new Error("No rider found with this id");
      }
    } catch (err: any) {
      console.log(err);
      res.json(functionsObj.output(0, err.message));
    }
  }
}
