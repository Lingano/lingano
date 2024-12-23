import { QuestionData } from "./QuestionData";

export interface QuizData {
    questions: QuestionData[];
    current: number;
}
