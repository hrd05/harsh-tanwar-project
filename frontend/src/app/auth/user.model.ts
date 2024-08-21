export class User {
  constructor(
    public name: string,
    public email: string,
    public phone: string,
    private token: string
  ) {}

  get accessToken() {
    return this.token;
  }
}
