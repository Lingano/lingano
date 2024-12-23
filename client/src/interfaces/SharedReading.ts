import { Reading } from "./Readings";
import { ObjectId } from "mongodb";
export interface SharedReading {
    reading_data: Reading;
    profile_picture: string;
    owner_name: string;
}

export interface SharedReadingExcerpt {
    owner_name: string;
    profile_picture: string;
    title: string;
    excerpt: string;
    language: string;
    category: string;
    owner: ObjectId;
    internal_user_id: number;
}
