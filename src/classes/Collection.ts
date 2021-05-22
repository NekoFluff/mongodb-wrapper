import { MongoDBDocument, Instantiable } from "../types/MongoDBTypes";
import ICollection from "../interfaces/ICollection";
import MongoConnector from "./MongoConnector";

export default class Collection<T extends MongoDBDocument> implements ICollection<T> {
  db = "db-name-unset";
  collection = "collection-name-unset";
  classType: Instantiable<T>;

  constructor(db: string, collection: string, classType: Instantiable<T>) {
    this.db = db;
    this.collection = collection;
    this.classType = classType;
  }

  async getDb() {
    return (await MongoConnector.getMongoDbClient()).db(this.db);
  }

  async getCollection() {
    const db = await this.getDb();
    return db.collection(this.collection);
  }

  async insert(items: T[]) {
    const collection = await this.getCollection();
    return await collection.insertMany(items);
  }

  async find<T2 = T>(
    filter: any,
    overrideClassType?: Instantiable<T2>
  ): Promise<Record<string, T2>> {
    const collection = await this.getCollection();
    const result = await collection.find(filter);
    const rawData = await result.toArray();
    return this.dataToObject<T2>(rawData, overrideClassType);
  }

  async aggregate<T2 = T>(
    aggregation: any,
    overrideClassType?: Instantiable<T2>
  ): Promise<Record<string, T2>> {
    const collection = await this.getCollection();
    const result = await collection.aggregate(aggregation);
    const rawData = await result.toArray();
    return this.dataToObject<T2>(rawData, overrideClassType);
  }

  // Effectively replaceAll
  async update(items: T[], upsert = false) {
    const collection = await this.getCollection();
    const options = { ordered: true };

    const bulkWriteOperations = items.map((item) => {
      return {
        replaceOne: {
          filter: { _id: item._id },
          replacement: item,
          upsert: upsert,
        },
      };
    });

    return await collection.bulkWrite(bulkWriteOperations, options);
  }

  async delete(filter: any) {
    const collection = await this.getCollection();
    return await collection.deleteOne(filter);
  }

  dataToObject<T2 = T>(
    rawData: any,
    overrideClassType?: Instantiable<T2>
  ): Record<string, T2> {
    let dataArray = JSON.parse(JSON.stringify(rawData));
    let dataObjects: any = {};

    const x = overrideClassType || this.classType;
    dataArray.map(function (obj: any) {
      dataObjects[obj["_id"]] = Object.assign(new x(), obj);
    });

    return dataObjects;
  }
}
