import express from "express";
import { userController } from "../controller/user";
import authenticate from "../middleware/auth";

const userControllerObj = new userController();

const router = express.Router();

router.post("/signup", userControllerObj.postSignup);

router.post("/login", userControllerObj.postLogin);

router.post(
  "/pickup-address",
  authenticate,
  userControllerObj.addPickupAddress
);

router.get("/pickup-address", authenticate, userControllerObj.getPickupAddress);

router.post(
  "/delivery-address",
  authenticate,
  userControllerObj.addDeliveryAddress
);

router.get(
  "/delivery-address",
  authenticate,
  userControllerObj.getDeliveryAddress
);

router.post("/calculate-fare", authenticate, userControllerObj.calculateFare);

router.get("/deliveries", authenticate, userControllerObj.getUserDeliveries);

router.get("/track/:rider_id", authenticate, userControllerObj.trackDelivery);

router.post("/cancel-delivery", authenticate, userControllerObj.cancelDelivery);

module.exports = router;
