import express from "express";

const router = express.Router();

import { deliveryController } from "../controller/delivery";
import authenticate from "../middleware/auth";

let deliveryControllerObj = new deliveryController();

router.post(
  "/book-delivery",
  authenticate,
  deliveryControllerObj.bookDeliveryHandler
);

module.exports = router;
