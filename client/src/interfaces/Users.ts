import { ReadingObject } from "./ReadingObject";
import { SavedWord } from "./SavedWord";

export interface User {
    name: string;
    email: string;
    // password: string;
    readings: ReadingObject[];
    saved_words: SavedWord[];
    premium: boolean;
    preferences: {
        theme: string;
        language: string;
        notificationsEnabled: boolean;
        privacy: {
            profileVisibility: string;
        };
    };
    profile: {
        profile_picture: string;
        description: string;
        languages: string[];
        location: string;
    };
    god_mode: boolean;
}

export interface Users {
    users: User[];
}
