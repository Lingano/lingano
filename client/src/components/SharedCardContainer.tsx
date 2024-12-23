import styles from "./SharedCardContainer.module.css";
import { useNavigate } from "react-router-dom";

type SharedCardContainerProps = {
    username: string;
    title: string;
    profilePicture: string;
    preview: string;
    action: () => void;
    language: string;
};

const SharedCardContainer: React.FC<SharedCardContainerProps> = ({
    username,
    title,
    profilePicture,
    preview,
    action,
    language,
}) => {
    const navigate = useNavigate();
    return (
        <div className={styles.SingleSharedCardContainer}>
            <div
                onClick={() => navigate(`/profile/${username}`)}
                className={styles.UserHeader}
            >
                <div className={styles.UserIcon}>
                    {/* user image (to add later/remove if needed/not needed) */}
                    <img
                        alt="User Icon"
                        src={profilePicture}
                        width="50px"
                        height="50px"
                    />
                </div>
                <div className={styles.UserName}>
                    <p>{username}</p>
                </div>
            </div>
            <div onClick={action} className={styles.CardContainer}>
                <div className={styles.top}>
                    <div className={styles.CardHeader}>
                        <h3>{title}</h3>
                    </div>
                    <div className={styles.CardBody}>
                        <p>{preview}</p>
                    </div>
                </div>
                <div className={styles.CardLanguage}>
                    <img src={`../flags/${language}.png`} width="20px"></img>
                    <p>{language}</p>
                </div>
            </div>
        </div>
    );
};

export default SharedCardContainer;
