import { appdb } from "./appdb";

export class dbdeliveries extends appdb {
  constructor() {
    super();
    (this.table = "deliveries"), (this.uniqueField = "id");
  }

  async createDelivery(delivery_data: any) {
    // console.log(delivery_data);
    const result = await this.insert(this.table, delivery_data);
    return result;
  }

  async getDeliveryWithId(id: number) {
    try {
      const result = await this.selectRecord(id, "*");
      return result[0];
    } catch (err) {
      throw err;
    }
  }

  async getDeliveryWithRiderId(rider_id: number) {
    try {
      const result = await this.select(
        this.table,
        "*",
        `WHERE rider_id='${rider_id}'`,
        "",
        ""
      );
      return result[0];
    } catch (err) {
      throw err;
    }
  }

  async updateDelivery(id: number, data: any) {
    try {
      console.log(data);
      const result = await this.updateRecord(id, data);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async findUserDeliveries(user_id: number) {
    try {
      const result = await this.select(
        this.table,
        "*",
        `WHERE user_id='${user_id}'`,
        "",
        ""
      );
      return result;
    } catch (err) {
      throw err;
    }
  }
}

const deliveryObj = new dbdeliveries();
export default deliveryObj;
