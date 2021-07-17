import { Instantiable, MongoDBDocument } from "../types/MongoDBTypes";

export type UpdateOptions = {
  filter?: any;
  upsert?: boolean;
}

export default interface ICollection<T extends MongoDBDocument> {
  insert(items: Array<T>): Promise<any>;
  find<T2 = T>(
    filter: any,
    overrideClassType?: Instantiable<T2>
  ): Promise<Record<string, T2>>;
  aggregate<T2 = T>(
    aggregation: any,
    overrideClassType?: Instantiable<T2>
  ): Promise<Record<string, T2>>;
  update(items: Array<T>): Promise<any>;
  deleteOne(filter: any): Promise<any>;
  dataToObject<T2 = T>(
    rawData: any,
    overrideClassType?: Instantiable<T2>
  ): Record<string, T2>;
}
