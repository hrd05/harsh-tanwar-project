import * as geolib from "geolib";
import { Request, Response } from "express";
import functionsObj from "../library/functions";
import { deliverySchema, validateRequest } from "../helpers/validation_schema";
import riderObj from "../model/dbriders";
import deliveryObj from "../model/dbdeliveries";
import { scheduleDeliveryJob } from "../services/schedule";

export class deliveryController {
  public async bookDeliveryHandler(req: Request, res: Response) {
    const {
      pickup_location,
      delivery_location,
      user,
      fare,
      isImmediate,
      scheduled_time,
    } = await validateRequest(req, deliverySchema);

    try {
      const pickup_point = {
        latitude: pickup_location.latitude,
        longitude: pickup_location.longitude,
      };

      if (isImmediate) {
        const riders = await riderObj.getAvailableRiders();

        if (riders.length === 0) {
          return res
            .status(404)
            .json(functionsObj.output(0, "No available riders found"));
        }

        const nearestRider: any = geolib.findNearest(pickup_point, riders);
        // console.log("Nearest Rider:", nearestRider);

        if (!nearestRider) {
          return res
            .status(404)
            .json(functionsObj.output(0, "No nearest riders found"));
        }

        const delivery_data = {
          user_id: user.id,
          rider_id: nearestRider.id,
          pickup_address: pickup_location.address,
          pickup_latitude: pickup_location.latitude,
          pickup_longitude: pickup_location.longitude,
          delivery_address: delivery_location.address,
          delivery_latitude: delivery_location.latitude,
          delivery_longitude: delivery_location.longitude,
          delivery_status: "rider assigned",
          fare: fare,
        };

        console.log(delivery_data);

        await deliveryObj.createDelivery(delivery_data);

        await riderObj.updateRider(delivery_data.rider_id, {
          available: false,
        });

        res.json(
          functionsObj.output(1, "Delivery Booked Succesfully", {
            rider_detail: nearestRider,
          })
        );
      } else {
        console.log("scheduling....");
        if (!scheduled_time) {
          res.json(functionsObj.output(1, "Please specify schedule time"));
        }

        const delivery_data: any = {
          user_id: user.id,
          pickup_address: pickup_location.address,
          pickup_latitude: pickup_location.latitude,
          pickup_longitude: pickup_location.longitude,
          delivery_address: delivery_location.address,
          delivery_latitude: delivery_location.latitude,
          delivery_longitude: delivery_location.longitude,
          delivery_status: "scheduled",
          fare: fare,
          scheduled_time,
        };

        const delivery_id = await deliveryObj.createDelivery(delivery_data);
        delivery_data["delivery_id"] = delivery_id;
        delivery_data["pickup_point"] = pickup_point;

        scheduleDeliveryJob(delivery_data, scheduled_time);

        return res.json(
          functionsObj.output(1, "Delivery scheduled successfully")
        );
      }
    } catch (err: any) {
      console.log(err);
      if (err.isJoi) {
        res.json(functionsObj.output(0, err.details[0].message));
      }
      res.json(functionsObj.output(0, err.message));
    }
  }
}
