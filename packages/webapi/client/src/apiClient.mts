/* eslint-disable @typescript-eslint/ban-ts-comment */
import { METHODS } from "http";
import ts from "typescript";

type NewType = any;

type ObjOrFormData =
  | {
      [x: string]: any;
    }
  | FormData;

export class ApiClient {
  //@ts-expect-error
  hostURL: URL;

  static HTTP_VERBS = METHODS.filter((p) => p in ["GET", "POST", "PUT", "DELETE", "WS"]);

  constructor(host: string | URL = process.env.API_ORIGIN) {
    this.hostURL = new URL(host);
    ApiClient.HTTP_VERBS.forEach((method) => {
      this[method.toLowerCase()] = async (path: string | URL, params?: ObjOrFormData) => {
        const meth = method;
        let body = new FormData();
        if (params instanceof FormData) {
          body = params;
        } else {
          for (const key in params) {
            body.append(key, params[key]);
          }
        }

        const response = await fetch(this.urlFor(path), this.headersFor({ method: meth, body }));
        const json = await response.json();

        if (!response.ok) {
          return Promise.reject(response);
        }
        if (!json.ok) {
          return Promise.reject(json);
        }
        return json;
      };
    });
  }
  //@ts-expect-error
  defaultHeaders: RequestInit = {
    credentials: "include",
  };
  //@ts-expect-error
  urlFor(path: string | URL) {
    return new URL(path, this.hostURL);
  }
  //@ts-expect-error
  headersFor(headers?: { method: string; body?: FormData }): RequestInit {
    return Object.assign({}, this.defaultHeaders, headers);
  }

  public async get(path: string | URL, params?: { [x: string]: any }): Promise<any> {
    const response = await fetch(new URL(path, this.hostURL), this.headersFor());
    const json = await response.json();

    if (!response.ok) {
      return Promise.reject(response);
    }
    if (!json.ok) {
      return Promise.reject(json);
    }
    return json;
  }

  [x: string]: (path: string | URL, params?: ObjOrFormData) => Promise<any>;

  public async post(path: any, params?: { [x: string]: any } | FormData): Promise<any> {
    let body = new FormData();
    if (params instanceof FormData) {
      body = params;
    } else {
      for (const key in params) {
        body.append(key, params[key]);
      }
    }

    const response = await fetch(this.urlFor(path), this.headersFor({ method: "post", body }));
    const json = await response.json();

    if (!response.ok) {
      return Promise.reject(response);
    }
    if (!json.ok) {
      return Promise.reject(json);
    }
    return json;
  }

  public async put(path: any, params?: ObjOrFormData): Promise<any> {
    let body = new FormData();
    if (params instanceof FormData) {
      body = params;
    } else {
      for (const key in params) {
        body.append(key, params[key]);
      }
    }

    const response = await fetch(this.urlFor(path), this.headersFor({ method: "put", body }));
    const json = await response.json();

    if (!response.ok) {
      return Promise.reject(response);
    }
    if (!json.ok) {
      return Promise.reject(json);
    }
    return json;
  }

  public async delete(path: string | URL, params?: { [x: string]: any }): Promise<any> {
    const response = await fetch(this.urlFor(path), this.headersFor({ method: "delete" }));
    const json = await response.json();

    if (!response.ok) {
      return Promise.reject(response);
    }
    if (!json.ok) {
      return Promise.reject(json);
    }
    return json;
  }
}
