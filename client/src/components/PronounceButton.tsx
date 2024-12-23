import { FaVolumeHigh } from "react-icons/fa6";

interface Props {
    onClick: () => void;
}

const SpeakerButton = ({ onClick }: Props) => {
    const buttonStyle = {
        padding: "10px",
        paddingBottom: "5px",
        cursor: "pointer",
    };

    return (
        <div style={buttonStyle} onClick={onClick}>
            <FaVolumeHigh size={20} color="#ae9152" />
        </div>
    );
};

export default SpeakerButton;
