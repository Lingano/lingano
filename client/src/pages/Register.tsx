import { FieldValues, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import styles from "./Register.module.css";
import { Helmet } from "react-helmet";
import api from "../utils/api";
import { AuthResponse } from "../interfaces/AuthResponse";
import { RegisterData } from "../interfaces/RegisterData";
import { User } from "../interfaces/Users";

const profilePictures = [
    "https://lingano.s3.eu-central-1.amazonaws.com/uploads/profile_pictures/default_icon0.jpeg",
    "https://lingano.s3.eu-central-1.amazonaws.com/uploads/profile_pictures/default_icon1.jpeg",
    "https://lingano.s3.eu-central-1.amazonaws.com/uploads/profile_pictures/default_icon2.jpeg",
    "https://lingano.s3.eu-central-1.amazonaws.com/uploads/profile_pictures/default_icon3.jpeg",
    "https://lingano.s3.eu-central-1.amazonaws.com/uploads/profile_pictures/default_icon4.jpeg",
];

interface Props {
    setUser: (newUser: User) => void;
}

const RegisterPage = ({ setUser }: Props) => {
    const navigate = useNavigate();
    const registerMessage = useRef<HTMLParagraphElement>(null);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [selectedProfilePicture, setSelectedProfilePicture] = useState<
        string | null
    >(null);
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
        null
    );

    const handleProfilePictureSelect = (path: string) => {
        setSelectedProfilePicture(path);
        setProfilePictureFile(null); // Reset file if selecting default picture
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterData>();

    const handleRegisterUser = (data: FieldValues) => {
        console.log("Registering.");
        const formDataWithProfilePicture: RegisterData = {
            name: data.name,
            email: data.email,
            password: data.password,
            profilePicture: profilePictureFile,
        };
        if (selectedProfilePicture && !profilePictureFile) {
            formDataWithProfilePicture.profilePicture = selectedProfilePicture;
        }
        console.log(formDataWithProfilePicture, profilePictureFile);
        api.registerUser(formDataWithProfilePicture)
            .then((response: AuthResponse) => {
                if (response.user_data) {
                    setUser(response.user_data);
                    navigate("/main");
                } else if (response) {
                    return response; // Handle failure
                }
            })
            .catch((error) => {
                if (registerMessage.current && error?.message) {
                    registerMessage.current.innerHTML = error.message;
                }
            });
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePictureFile(file); // Store file in state
        }
    };

    return (
        <>
            <Helmet>
                <title>Welcome to Lingano!</title>
                {/* <link rel="icon" href="/path/to/icon.png" /> */}
            </Helmet>
            <div className={styles.registerContainer}>
                <h1 className={styles.title}>Register to Lingano!</h1>
                <form
                    onSubmit={handleSubmit(handleRegisterUser)}
                    className={styles.form}
                >
                    <div className={styles.inputs}>
                        <div className={styles.nameBlock}>
                            <label htmlFor="name" className={styles.label}>
                                Name
                            </label>
                            <input
                                {...register("name", {
                                    required: true,
                                    minLength: 5,
                                    maxLength: 50,
                                })}
                                id="name"
                                type="text"
                                className={styles.input}
                                placeholder="Name"
                            ></input>
                            {errors.name?.type === "required" && (
                                <p className={styles.error}>Name is required</p>
                            )}
                            {errors.name?.type === "minLength" && (
                                <p className={styles.error}>
                                    Name must be at least 5 characters long.
                                </p>
                            )}
                            {errors.name?.type === "maxLength" && (
                                <p className={styles.error}>
                                    Name must be at most 50 characters long.
                                </p>
                            )}
                        </div>
                        <div className={styles.emailBlock}>
                            <label htmlFor="email" className={styles.label}>
                                Email
                            </label>
                            <input
                                {...register("email", {
                                    required: true,
                                    minLength: 5,
                                    maxLength: 50,
                                })}
                                id="email"
                                type="text"
                                className={styles.input}
                                placeholder="example@mail.com"
                            ></input>
                            {errors.email?.type === "required" && (
                                <p className={styles.error}>
                                    Email is required
                                </p>
                            )}
                            {errors.email?.type === "minLength" && (
                                <p className={styles.error}>
                                    Email must be at least 5 characters long.
                                </p>
                            )}
                        </div>
                        <div className={styles.passwordBlock}>
                            <label htmlFor="email" className={styles.label}>
                                Password
                            </label>
                            <div className={styles.passwordInputButtonWrapper}>
                                <input
                                    {...register("password", {
                                        required: true,
                                        minLength: 8,
                                    })}
                                    id="password"
                                    type={passwordVisible ? "text" : "password"}
                                    className={styles.input}
                                    placeholder="password"
                                ></input>
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className={styles.toggleButton}
                                >
                                    {passwordVisible ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errors.password?.type === "required" && (
                                <p className={styles.error}>
                                    Password is required
                                </p>
                            )}
                            <p
                                ref={registerMessage}
                                className={styles.registerMessage}
                            ></p>
                        </div>
                        <div className={styles.pictureBlock}>
                            <label className={styles.label}>
                                Profile Picture
                            </label>
                            <div className={styles.profilePictures}>
                                {profilePictures.map((path) => (
                                    <img
                                        key={path}
                                        src={path}
                                        alt="Profile"
                                        className={`${styles.profilePicture} ${
                                            selectedProfilePicture === path
                                                ? styles.selected
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleProfilePictureSelect(path)
                                        }
                                    />
                                ))}
                            </div>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className={styles.fileInput}
                            />
                        </div>
                    </div>
                    <button type="submit" className={styles.submitButton}>
                        Register
                    </button>
                </form>
                <p className={styles.loginPrompt}>Want to login instead?</p>
                <Link to={"/login"} className={styles.loginLink}>
                    Login here
                </Link>
            </div>
        </>
    );
};

export default RegisterPage;
