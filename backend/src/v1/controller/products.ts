import express from "express";
import Joi from "joi";
import { functions } from "../library/functions";
import { validations } from "../library/validations";
import { dbproducts } from "../model/dbproducts";

const router = express.Router();

router.post("/", listSchema, list);

router.get("/harsh", (req, res) => {
  res.send("hello world");
});

// router.post('/view', viewSchema, view);

module.exports = router;

/**
 * Validation function for list orders route
 */
function listSchema(req: any, res: any, next: any) {
  let schema = Joi.object({
    seller_id: Joi.number().integer().required(),
  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
}

/**
 * Request for new medicine
 */
async function list(req: any, res: any) {
  let productsObj = new dbproducts();
  let seller_id = req.body.seller_id;
  let result: any = await productsObj.getProducts(seller_id);

  var functionsObj = new functions();
  res.send(functionsObj.output(1, "SUCCESS", result));
  return false;
}
