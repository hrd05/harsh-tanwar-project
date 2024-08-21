import { appdb } from "./appdb";

export class riders extends appdb {
  constructor() {
    super();
    this.table = "riders";
    this.uniqueField = "id";
  }

  async getAvailableRiders() {
    try {
      const result = await this.select(
        this.table,
        "*",
        `WHERE status='online' AND available=${true}`,
        "",
        ""
      );
      return result;
    } catch (err) {
      throw err;
    }
  }

  async updateRider(id: number, data: any) {
    const result = await this.updateRecord(id, data);
    return result;
  }

  async riderDetail(id: number) {
    const result = await this.selectRecord(
      id,
      "id, name, phone, latitude, longitude"
    );
    return result[0];
  }

  async getRiderLocation(id: number) {
    try {
      const result = await this.selectRecord(id, "latitude, longitude");
      return result[0];
    } catch (err) {
      throw err;
    }
  }
}

const riderObj = new riders();
export default riderObj;
