import { UserObject } from "./UserObject";
import { Word } from "./Word";
import { ObjectId } from "mongodb";

export interface Reading {
    internal_user_id: number;
    owner: ObjectId;
    owner_name: string;
    users: UserObject[];
    title: string;
    category: string;
    text: string;
    formatted_text: Word[][][];
    translation_cache: string[][];
    language: string;
    public_access: boolean;
    _id: ObjectId;
}

export interface ReadingExcerpt {
    title: string;
    excerpt: string;
    reading_internal_id: number;
    language: string;
}

export interface Readings {
    readings: Reading[];
}
