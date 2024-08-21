import { appdb } from "./appdb";

export class dbproducts extends appdb {
  constructor() {
    super();
    this.table = "products";
    this.uniqueField = "id";
  }

  /**
   * Make sure to write proper commenting for future reference
   * @param seller_id seller whom products is needed
   * @returns array
   */
  async getProducts(seller_id: number) {
    this.where = " WHERE seller_id = " + seller_id;
    this.page = 5;
    this.orderby = " ORDER by id desc";
    this.rpp = 50;
    let results: any[] = await this.listRecords("*");
    return results;
  }
}
