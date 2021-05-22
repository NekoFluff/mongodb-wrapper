import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

export default class MongoConnector {
  private static mongodbClient: MongoClient;

  static async getMongoDbClient() {
    if (this.mongodbClient) {
      return this.mongodbClient;
    } else {
      return await this.connectToMongo()
    }
  }

  private static async connectToMongo() {
    const mongoClientOptions = {
      poolSize: 50,
      keepAlive: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    if (process.env.MONGO_CONNECTION_URL) {
      return await MongoClient.connect(process.env.MONGO_CONNECTION_URL, mongoClientOptions);
    } else {
      throw new Error("MONGO_CONNECTION_URL environment variable not set. Cannot connect to DB.")
    }
  }
}
