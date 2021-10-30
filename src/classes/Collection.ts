import { MongoDBDocument, Instantiable } from "../types/MongoDBTypes";
import ICollection, { UpdateOptions } from "../interfaces/ICollection";
import MongoConnector from "./MongoConnector";
import { AnyBulkWriteOperation, BulkWriteOptions, Filter } from "mongodb";
import { Document } from "mongodb";

export default class Collection<T extends MongoDBDocument> implements ICollection<T> {
  url?: string
  db = "db-name-unset";
  collection = "collection-name-unset";
  classType: Instantiable<T>;

  constructor(db: string, collection: string, classType: Instantiable<T>, url?: string) {
    this.url = url;
    this.db = db;
    this.collection = collection;
    this.classType = classType;
  }

  async getDb() {
    return (await MongoConnector.getMongoDbClient(this.url)).db(this.db);
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
    filter: Filter<Document>,
    overrideClassType?: Instantiable<T2>
  ): Promise<Record<string, T2>> {
    const collection = await this.getCollection();
    const result = await collection.find(filter);
    const rawData = await result.toArray();
    return this.dataToObject<T2>(rawData, overrideClassType);
  }

  async findOne<T2 = T>(
    filter: Filter<Document>,
    overrideClassType?: Instantiable<T2>
  ): Promise<Record<string, T2>> {
    const collection = await this.getCollection();
    const result = await collection.findOne(filter);
    const rawData = [result];
    return this.dataToObject<T2>(rawData, overrideClassType);
  }

  async aggregate<T2 = T>(
    aggregation: any[],
    overrideClassType?: Instantiable<T2>
  ): Promise<Record<string, T2>> {
    const collection = await this.getCollection();
    const result = await collection.aggregate(aggregation);
    const rawData = await result.toArray();
    return this.dataToObject<T2>(rawData, overrideClassType);
  }

  /**
   * Returns the total number of documents
   * @returns Total number of documents
   */
  async getTotalCount(groupBy: string | Document, match: Filter<T> = {}) {
    const pipeline = [
      { $match: match },
      { $group: { _id: groupBy, totalCount: { $sum: 1 } } },
    ];

    const collection = await this.getCollection();
    const result = await collection.aggregate(pipeline).toArray();
    return result as { _id: any, totalCount: number }[];
  }

  /**
   * Effectively replaceAll
  */
  async update(items: T[], options: UpdateOptions = {}) {
    const collection = await this.getCollection();

    const bulkWriteOperations = items.map((item) => {
      return {
        replaceOne: {
          filter: options.filter ?? { _id: item._id },
          replacement: item,
          upsert: options.upsert ?? false,
        },
      };
    });

    const bulkWriteOptions = { ordered: true };
    return await collection.bulkWrite(bulkWriteOperations, bulkWriteOptions);
  }

  async bulkWrite(bulkWriteOperations: AnyBulkWriteOperation<any>[], options: BulkWriteOptions) {
    const collection = await this.getCollection();
    return await collection.bulkWrite(bulkWriteOperations, options);
  }

  async deleteOne(filter: Filter<MongoDBDocument>) {
    const collection = await this.getCollection();
    return await collection.deleteOne(filter);
  }

  async deleteMany(filter: Filter<MongoDBDocument>) {
    const collection = await this.getCollection();
    return await collection.deleteMany(filter);
  }

  dataToObject<T2 = T>(
    rawData: any[],
    overrideClassType?: Instantiable<T2>
  ): Record<string, T2> {
    let dataObjects: any = {};

    const targetClassType = overrideClassType || this.classType;
    rawData.map(function (obj: any) {
      const newObj: any = new targetClassType();
      dataObjects[obj["_id"].toString()] = Object.assign(newObj, obj);
    });
    return dataObjects;
  }
}
