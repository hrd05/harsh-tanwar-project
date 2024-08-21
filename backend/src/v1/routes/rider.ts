import express from "express";

const router = express.Router();

import { riderController } from "../controller/rider";
const riderControllerObj = new riderController();

router.get("/delivery", riderControllerObj.getDeliveryDetail);

router.post("/update-location", riderControllerObj.updateLocation);

router.post("/cancel-delivery", riderControllerObj.cancelAndAssignNewRider);

router.get("/:rider_id", riderControllerObj.getRiderDetail);

router.post(
  "/update-status/:deliveryid",
  riderControllerObj.updateStatusOfDelivery
);

module.exports = router;
