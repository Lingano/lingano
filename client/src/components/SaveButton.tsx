import { useState } from "react";
import { MdAddCircleOutline, MdOutlineAddCircle } from "react-icons/md";

interface Props {
    onActivate: () => void;
}

const SaveButton = ({ onActivate }: Props) => {
    const [activated, setActivated] = useState<boolean>(false);

    const activate = () => {
        onActivate();
        setActivated(true);
    };

    const buttonStyle = {
        padding: "10px",
        paddingBottom: "5px",
        cursor: "pointer",
    };

    if (activated) {
        return (
            <div style={buttonStyle}>
                <MdOutlineAddCircle size={20} color="#ae9152" />
            </div>
        );
    } else {
        return (
            <div style={buttonStyle} onClick={activate}>
                <MdAddCircleOutline size={20} color="#ae9152" />
            </div>
        );
    }
};

export default SaveButton;
