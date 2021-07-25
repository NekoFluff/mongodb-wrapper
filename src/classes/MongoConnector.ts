import { MongoClient, MongoClientOptions } from "mongodb";

const defaultMongoClientOptions: MongoClientOptions = {};

export default class MongoConnector {
  private static defaultConnectionURL = ""
  private static clients: { [key: string]: MongoClient } = {};

  static setDefaultConnectionURL(url: string) {
    this.defaultConnectionURL = url;
  }

  static async getMongoDbClient(url?: string, options?: MongoClientOptions) {
    url = url ?? this.defaultConnectionURL;

    if (!this.clients[url]) {
      this.clients[url] = await this.connectToMongo(url ?? this.defaultConnectionURL, options);
    }
    return this.clients[url]
  }

  private static async connectToMongo(url: string, options?: MongoClientOptions) {
    if (url) {
      return await MongoClient.connect(url, options ?? defaultMongoClientOptions);
    } else {
      throw new Error(`Connection url ${url} is invalid.`)
    }
  }
}
