import { ApiClient } from "@thylacine-js/webapi-client/apiClient.mjs";
export class Client extends ApiClient {
  constructor(host: string | URL | undefined = process.env.API_ORIGIN) {
    super(host);
  }
  public async get(...params): Promise<any> {
    return super.get(params);
  }
  public async loginWithPassword(...params): Promise<any> {
    return super.post(params);
  }
  public async loginWithToken(...params): Promise<any> {
    return super.post(params);
  }
  public async allLogout(...params): Promise<any> {
    return super.all(params);
  }
  public async getSession(...params): Promise<any> {
    return super.get(params);
  }
  public async getUsersId(id: string): Promise<any> {
    return super.get(`/users/${id}`);
  }
  public async wsWs(...params): Promise<any> {
    return super.ws(params);
  }
}
