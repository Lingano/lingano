import { Word } from "../interfaces/Word";

interface Props {
    word: Word;
    selected: boolean;
    clicked: boolean;
    isLast: boolean;
    onClick: () => void;
    colors: string[];
}

const ClickableWord = ({ word, selected, clicked, isLast, onClick, colors }: Props) => {

    return (
        <>
            {word.prefix && <span style={selected ? { backgroundColor: colors[1] } : {}}>{word.prefix}</span>}

            <span onClick={onClick} style={clicked ? { backgroundColor: colors[0] } : (selected ? { backgroundColor: colors[1] } : {})}>
                {word.text}
            </span>

            {word.postfix && (
                <span style={selected ? { backgroundColor: colors[1] } : {}}>{word.postfix}</span>
            )}
            
            <span style={isLast ? {} : (selected ? { backgroundColor: colors[1] } : {})}> </span>
        </>
    );
};

export default ClickableWord;
