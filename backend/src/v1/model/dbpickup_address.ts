import { appdb } from "./appdb";

export class dbpickup_address extends appdb {
  constructor() {
    super();
    this.table = "user_pickup_addresses";
    this.uniqueField = "id";
  }

  async insertPickupAddress(
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

  async getPickupAddress(user_id: number) {
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

  async getCoordinateWithId(pickup_address_id: number) {
    const result = await this.selectRecord(
      pickup_address_id,
      "latitude, longitude"
    );
    return result;
  }
}

const pickupAddObj = new dbpickup_address();
export default pickupAddObj;
