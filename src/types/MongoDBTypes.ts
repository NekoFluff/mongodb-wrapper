import { Document, ObjectId } from "mongodb";

export interface Instantiable<T> {
  new(...args: any[]): T;
}

export interface MongoDBDocument extends Document {
  _id: ObjectId;
}
