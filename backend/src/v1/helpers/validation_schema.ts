import { Request, Response } from "express";
import Joi from "joi";

// export class validations {
//     public sign
// }
const userSchema = Joi.object({
  id: Joi.number().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.number(),
});

const signupSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(5).required(),
  phone: Joi.string().length(10).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

const addressSchema = Joi.object({
  address: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  user: userSchema.required(),
});

const fareSchema = Joi.object({
  pickup_address_id: Joi.number().required(),
  delivery_address_id: Joi.number().required(),
});

const riderSchema = Joi.object({
  rider_id: Joi.number().required(),
});

const deliveryIdSchema = Joi.object({
  delivery_id: Joi.number().required(),
  user: userSchema.required(),
});

const riderAndLocatioSchema = Joi.object({
  rider_id: Joi.number().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
});

const riderAndDeliverySchema = Joi.object({
  rider_id: Joi.number().required(),
  delivery_id: Joi.number().required(),
});

const locationSchema = Joi.object({
  address: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
});

const deliverySchema = Joi.object({
  pickup_location: locationSchema.required(),
  delivery_location: locationSchema.required(),
  user: userSchema.required(),
  fare: Joi.number().min(0).required(),
  isImmediate: Joi.boolean().required(),
  scheduled_time: Joi.string().when("isImmediate", {
    is: false,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});

const validateRequest = async (req: Request, schema: any) => {
  try {
    const value = await schema.validateAsync(req.body);
    return value;
  } catch (err) {
    throw err;
  }
};

export {
  signupSchema,
  loginSchema,
  addressSchema,
  fareSchema,
  riderSchema,
  deliveryIdSchema,
  riderAndLocatioSchema,
  riderAndDeliverySchema,
  deliverySchema,
  validateRequest,
};
