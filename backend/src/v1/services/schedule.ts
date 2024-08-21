import * as geolib from "geolib";
import * as schedule from "node-schedule";
import riderObj from "../model/dbriders";
import deliveryObj from "../model/dbdeliveries";
import { number } from "joi";

interface pickup_point {
  latitude: number;
  longitude: number;
}

interface delivery_data {
  user_id: number;
  pickup_address: string;
  delivery_address: string;
  delivery_id: number;
  fare: number;
  pickup_point: pickup_point;
}

export const scheduleDeliveryJob = (
  delivery_data: delivery_data,
  scheduledTime: Date
) => {
  scheduledTime = new Date(scheduledTime);
  const assignmentTime = new Date(scheduledTime.getTime() - 60 * 60 * 1000);
  console.log(assignmentTime, "in scheduling delivery");

  const job = schedule.scheduleJob(assignmentTime.toISOString(), async () => {
    console.log(
      `Running scheduled job to assign rider for delivery id: ${delivery_data.delivery_id}`
    );

    const pickup_point: pickup_point = delivery_data.pickup_point;

    const riders = await riderObj.getAvailableRiders();

    if (riders.length === 0) {
      throw new Error("No available riders");
    }

    const nearestRider: any = geolib.findNearest(pickup_point, riders);

    if (!nearestRider) {
      throw new Error("No nearest rider found");
      return;
    }

    await deliveryObj.updateDelivery(delivery_data.delivery_id, {
      rider_id: nearestRider.id,
      delivery_status: "rider assigned",
    });

    await riderObj.updateRider(nearestRider.id, {
      available: false,
    });

    console.log(
      `Scheduled job for delivery ID: ${delivery_data.delivery_id} at ${assignmentTime}`
    );
  });
};
