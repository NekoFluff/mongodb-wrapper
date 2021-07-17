import { MongoClient, MongoClientOptions } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const defaultMongoClientOptions: MongoClientOptions = {};

export default class MongoConnector {
  private static mongodbClient: MongoClient;

  static async getMongoDbClient(options?: MongoClientOptions) {
    if (this.mongodbClient) {
      return this.mongodbClient;
    } else {
      return await this.connectToMongo(options)
    }
  }

  private static async connectToMongo(options?: MongoClientOptions) {
    if (process.env.MONGO_CONNECTION_URL) {
      return await MongoClient.connect(process.env.MONGO_CONNECTION_URL, options ?? defaultMongoClientOptions);
    } else {
      throw new Error("MONGO_CONNECTION_URL environment variable not set. Cannot connect to DB.")
    }
  }
}
