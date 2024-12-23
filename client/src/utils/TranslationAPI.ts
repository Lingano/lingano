export function translate(
    inputLanguage: string,
    outputLanguage: string,
    text: string
): Promise<string> {
    console.log(
        `Translating from ${inputLanguage} to ${outputLanguage}: ${text}`
    );
    return fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLanguage}&tl=${outputLanguage}&dt=t&q=${text}`,
        {
            method: "GET",
        }
    )
        .then((res) => res.json())
        .then((body) => {
            if (body?.[0]?.[0]?.[0]) return body[0][0][0];
            else throw new Error("Could not fetch translation.");
        })
        .catch((err: Error) => {
            console.error(err);
        });
};
