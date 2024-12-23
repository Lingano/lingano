import { ObjectId } from "mongodb";
import { Reading } from "./Readings";
export interface ReadingObject {
    owner: boolean;
    reading_id: ObjectId;
    reading_internal_id: number;
    reading_progress: number;
    clicked_words: Array<[number, number, number]>;
}

export interface ReadingObjectPopulated {
    owner: boolean;
    reading_id: ObjectId;
    reading_internal_id: number;
    reading_progress: number;
    clicked_words: Array<[number, number, number]>;
    reading_data: Reading;
}
