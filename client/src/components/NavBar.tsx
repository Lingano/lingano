import styles from "./NavBar.module.css";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { User } from "../interfaces/Users";

interface Props {
    user?: User;
    setUser: (newUser: User | undefined) => void;
}

const Navbar = ({ user, setUser }: Props) => {
    return (
        <nav>
            <div className={styles.leftPart}>
                <div className={styles.navbarLogo}>
                    <Link to="/main">
                        <img
                            src="/logo/navbar-logo.png"
                            alt="Logo"
                            className={styles.logo}
                        />
                    </Link>
                </div>
                <div className={styles.navbarMenu}>
                    <Link to={"/main"} className={styles.navItem}>
                        Main
                    </Link>
                    <Link to={"/import"} className={styles.navItem}>
                        New
                    </Link>
                    <Link to={"/word"} className={styles.navItem}>
                        Word Practice
                    </Link>
                    <Link
                        to={"/profile/" + user?.name}
                        className={styles.navItem}
                    >
                        My Profile
                    </Link>
                    {user && user.god_mode && (
                        <div className={styles.navItem}>
                            <Link to={"/admin"}>Admin</Link>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.rightPart}>
                {user ? (
                    <>
                        <div className={styles.rightButtonDiv}>
                            <div
                                onClick={() => {
                                    Cookies.remove("token");
                                    setUser(undefined);
                                }}
                            >
                                <Link to={"/login"} className={styles.navItem}>
                                    Logout
                                </Link>
                            </div>
                        </div>
                        <Link
                            to="/settings"
                            className={styles.profilePictureWrapper}
                        >
                            <div>
                                <img
                                    alt="Profile"
                                    src={
                                        user.profile?.profile_picture ||
                                        "profile_pictures/default_icon4.jpeg"
                                    }
                                    className={styles.profilePicture}
                                ></img>
                            </div>
                            <div className={styles.username}>{user.name}</div>
                        </Link>
                    </>
                ) : (
                    <Link to={"/login"} className={styles.navItem}>
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
