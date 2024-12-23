export const getLanguageFullName = (abbreviation: string) => {
    switch (abbreviation) {
        case "cz":
            return "Czech";
        case "en":
            return "English";
        case "fr":
            return "French";
        case "de":
            return "German";
        case "it":
            return "Italian";
        case "es":
            return "Spanish";
        default:
            return "Unknown";
    }
};
