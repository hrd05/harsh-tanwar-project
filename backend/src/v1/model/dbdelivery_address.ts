import { appdb } from "./appdb";

export class dbdelivery_address extends appdb {
  constructor() {
    super();
    this.table = "user_delivery_addresses";
    this.uniqueField = "id";
  }

  async insertDeliveryAddress(
    user_id: number,
    address: string,
    latitude: number,
    longitude: number
  ) {
    const data = {
      user_id,
      address,
      latitude,
      longitude,
    };
    try {
      const result = await this.insert(this.table, data);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async getDeliveryAddress(user_id: number) {
    try {
      const result = await this.select(
        this.table,
        "id, address, latitude, longitude",
        `WHERE user_id=${user_id}`,
        "",
        ""
      );
      return result;
    } catch (err) {
      throw err;
    }
  }

  async getCoordinateWithId(delivery_address_id: number) {
    const result = await this.selectRecord(
      delivery_address_id,
      "latitude, longitude"
    );
    return result;
  }
}

const deliveryAddObj = new dbdelivery_address();
export default deliveryAddObj;
