// import { useState, useRef } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import styles from "./Login.module.css";
import { Helmet } from "react-helmet";
import api from "../utils/api";
import { LoginData } from "../interfaces/LoginData";
import { User } from "../interfaces/Users";
// import { User } from "../interfaces/Users";

// interface ErrorResponseBody {
//     message: string;
// }

// interface AuthResponse {
//     user_data: User;
// }

interface Props {
    setUser: (newUser: User) => void;
}

const LoginPage = ({ setUser }: Props) => {
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Manage error message state
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginData>();

    const loginUser = (data: LoginData) => {
        console.log("Logging in:", data);

        api.loginUser(data)
            .then((response) => {
                if ("user_data" in response) {
                    console.log("Login response:", response);
                    console.log("Login successful. Redirecting...");
                    setUser(response.user_data);
                    navigate("/main");
                } else {
                    setErrorMessage(
                        response.message ||
                            "Login failed. Please check your credentials."
                    );
                }
            })
            .catch((error) => {
                setErrorMessage(
                    error.message || "An error occurred. Please try again."
                );
            });
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <>
            <Helmet>
                <title>Login to Lingano!</title>
            </Helmet>
            <div className={styles.loginContainer}>
                <h1 className={styles.title}>Login to Lingano!</h1>
                <form
                    onSubmit={handleSubmit(loginUser)}
                    className={styles.form}
                >
                    <div className={styles.topButtons}>
                        <Link to={"/"}>
                            <button>&#10216; Back</button>
                        </Link>
                        <Link to={"/"}>
                            <button>Skip &#10217;</button>
                        </Link>
                    </div>

                    <div className={styles.inputs}>
                        <div className={styles.emailBlock}>
                            <label htmlFor="email" className={styles.label}>
                                Email
                            </label>
                            <input
                                {...register("email", {
                                    required: true,
                                    minLength: 5,
                                })}
                                id="email"
                                type="text"
                                className={`${styles.input} ${
                                    errors.email ? styles.red : ""
                                }`}
                                placeholder="example@email.com"
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
                            <label htmlFor="password" className={styles.label}>
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
                                    className={`${styles.input} ${
                                        errors.password ? styles.red : ""
                                    }`}
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
                            {errors.password?.type === "minLength" && (
                                <p className={styles.error}>
                                    Password must be at least 8 characters long.
                                </p>
                            )}
                        </div>
                    </div>
                    <button type="submit" className={styles.submitButton}>
                        Log in
                    </button>
                    <p className={styles.error}>{errorMessage}</p>
                </form>
                <p className={styles.registerPrompt}>
                    Want to register instead?
                </p>
                <Link to={"/register"} className={styles.registerLink}>
                    Register here
                </Link>
            </div>
        </>
    );
};

export default LoginPage;
