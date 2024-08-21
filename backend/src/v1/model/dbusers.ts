import { appdb } from "./appdb";

export class dbusers extends appdb {
  constructor() {
    super();
    this.table = "users";
    this.uniqueField = "id";
  }

  async insertUser(
    name: string,
    email: string,
    phone: string,
    password: string
  ) {
    const user_data = {
      name,
      email,
      phone,
      password,
    };
    try {
      let result: any = await this.insert(this.table, user_data);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async findUser(email: string) {
    const result: any = await this.select(
      this.table,
      "*",
      `WHERE email='${email}'`,
      "",
      ""
    );
    // console.log(result);
    return result[0];
  }

  async findUserWithId(id: number) {
    const result: any = await this.selectRecord(id, "id, name, email, phone ");
    return result[0];
  }
}

const userObj = new dbusers();
export default userObj;
