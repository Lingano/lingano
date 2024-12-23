import { ObjectId } from "mongodb";

export interface UserObject {
    user_id: ObjectId;
    reading_internal_id: number;
}
