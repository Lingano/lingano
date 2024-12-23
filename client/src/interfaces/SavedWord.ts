import { ObjectId } from "mongodb";

export interface SavedWord {
    text: string;
    meaning: string;
    language: string;
    knowledge_level: number;
    location: [number, number, number];
    from_reading: ObjectId;
    interval: number;
    easinessFactor: number;
    repetitions: number;
    dueDate: Date;
    lastReviewed: Date;
    favourite: boolean;
}
