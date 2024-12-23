import { Link } from "react-router-dom";
import styles from "./LandingPage.module.css";
import { Helmet } from "react-helmet";

const LandingPage = () => {
    return (
        <>
            <Helmet>
                <title> Welcome to Lingano </title>
            </Helmet>
            <header>
                <div className={styles.imageContainer}>
                    <img alt="logo" src="../logo/navbar-logo.png" />
                </div>
                <div className={styles.headerButtons}>
                    <Link to={"/login"}>
                        <button className={styles.loginButton}>Login</button>
                    </Link>
                    <Link to={"/register"}>
                        <button className={styles.registerButton}>
                            Register
                        </button>
                    </Link>
                </div>
            </header>

            <main>
                {/*  */}
                <section className={styles.firstSection}>
                    <h1>
                        Start learing today the language you always wanted to
                        learn
                    </h1>
                    <p>With Lingano you'll master other languages</p>
                    <Link to={"/"}>
                        <button>Start learning as Guest</button>
                    </Link>
                </section>

                <section className={styles.secondSection}>
                    <div className={styles.left}>
                        <h1> The main page </h1>
                        <p>
                            Our main page provides an organized view of your
                            personal readings and shared readings from others.
                            At the top of the page, navigation options like
                            "Main," "New," and "My Readings" are displayed for
                            easy access. The central section, titled "Continue
                            Reading," showcases cards representing individual
                            readings. Each card includes a title, a snippet of
                            the text, and the language it is in. Users can click
                            on any card to dive into the full reading, where
                            they can engage in interactive activities such as
                            studying, translating words, and taking quizzes to
                            reinforce their language skills. This interface is
                            user-friendly, promoting a seamless learning
                            experience.
                        </p>
                    </div>
                    <div className={styles.right}>
                        <img
                            alt="main page photo"
                            src="../landing_page/mainpage-screenshot.png"
                        />
                    </div>
                </section>

                <section className={styles.thirdSection}>
                    <div className={styles.right}>
                        <img
                            alt="reading page photo"
                            src="../landing_page/ReadingAndDictionary-screenshot.png"
                        />
                    </div>
                    <div className={styles.left}>
                        <h1> Go through the text </h1>
                        <p>
                            The reading section of the website focuses on
                            reading and translation activities, allowing users
                            to deeply engage with the text. The main content
                            area displays an article or passage in its original
                            language, providing an authentic context for
                            language practice. Highlighted words or sentences
                            can be interacted with; for example, when a word is
                            selected, a dictionary section on the right shows
                            its meaning, translation, and pronunciation options,
                            such as saving the word for later review.
                            Additionally, the entire highlighted sentence is
                            translated for contextual understanding. A "Quizzes"
                            tab is also available to switch between translation
                            activities and further language practice. This
                            feature-rich interface helps users enhance
                            vocabulary and comprehension while staying immersed
                            in real-world texts.
                        </p>
                    </div>
                </section>

                <section className={styles.fourthSection}>
                    <div className={styles.left}>
                        <h1> Exercise </h1>
                        <p>
                            In the <b>Flashcards</b> page, users can study key
                            vocabulary or phrases in a visually appealing
                            interface. A single term or phrase is displayed on a
                            colorful card, and users can mark it as learned by
                            clicking on a star icon. Navigation arrows allow
                            users to cycle through their stack of flashcards,
                            providing a focused and personalized vocabulary
                            review experience.
                        </p>
                        <p>
                            <b>Quizzes</b> engage users with
                            sentence-understanding activities. For example, a
                            sentence in the original language is presented at
                            the top, and users are tasked with arranging a
                            series of provided words to correctly translate the
                            sentence into their target language. This gamified
                            approach to learning reinforces sentence structure
                            and comprehension while making the learning process
                            interactive and enjoyable.
                        </p>
                    </div>
                    <div className={styles.right}>
                        <img
                            alt="quiz page photo"
                            src="../landing_page/quiz-screenshot.png"
                            className={styles.quizImage}
                        />
                        <img
                            alt="flashcard page photo"
                            src="../landing_page/flashcard-screenshot.png"
                            className={styles.flashcardImage}
                        />
                    </div>
                </section>
            </main>

            <footer>
                <div className={styles.top}>
                    <h1>About the project</h1>
                    <div className={styles.descriptionBlock}>
                        <p>
                            In the SA3 course at USI (Università della Svizzera
                            italiana), we created a language learning web app.
                            The app helps users learn new languages by offering
                            interactive content, exercises, and vocabulary
                            practice. We built the app using Node.js for the
                            backend, React for the frontend, TypeScript to make
                            the code more reliable, and MongoDB to store data.
                            Our goal was to make language learning easy, fun,
                            and accessible to everyone.
                        </p>
                    </div>
                    <div className={styles.gridWrapper}>
                        <div className={styles.team}>
                            <h2>Team</h2>
                            <p>
                                This project was developed by the following
                                team:
                            </p>
                            <ul>
                                <li>Frantisek Vlcek</li>
                                <li>Mateusz Cupryniak</li>
                                <li>Theodoros Thomas</li>
                                <li>Samuele Daminato</li>
                                <li>Mehmet Bayazit</li>
                            </ul>
                        </div>
                        <div className={styles.technologies}>
                            <h2>Tech</h2>
                            <p>
                                Throughout this project we used different
                                technologies such as the following
                            </p>
                            <div className={styles.techGrid}>
                                <div className={styles.line}>
                                    <div className={styles.imgWrapper}>
                                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" />
                                    </div>
                                    <div className={styles.imgWrapper}>
                                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original-wordmark.svg" />
                                    </div>
                                    <div className={styles.imgWrapper}>
                                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original-wordmark.svg" />
                                    </div>
                                </div>
                                <div className={styles.line}>
                                    <div className={styles.imgWrapper}>
                                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original-wordmark.svg" />
                                    </div>
                                    <div className={styles.imgWrapper}>
                                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original-wordmark.svg" />
                                    </div>
                                    <div className={styles.imgWrapper}>
                                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original-wordmark.svg" />
                                    </div>
                                </div>
                                <div className={styles.line}>
                                    <div className={styles.imgWrapper}>
                                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongoose/mongoose-original-wordmark.svg" />
                                    </div>
                                    <div className={styles.imgWrapper}>
                                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original-wordmark.svg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.credits}>
                        <h3>Credits</h3>
                        <p>
                            Countries flags are from:{" "}
                            <a
                                target="blank"
                                href="https://www.countryflags.com"
                            >
                                https://www.countryflags.com
                            </a>
                        </p>
                        <p>
                            Landing page background image:{" "}
                            <a target="blank" href="https://www.freepik.com">
                                https://www.freepik.com
                            </a>
                        </p>
                        <p>
                            Technologies icons from:{" "}
                            <a target="blank" href="https://devicon.dev">
                                https://devicon.dev
                            </a>
                        </p>
                    </div>
                </div>

                <div className={styles.footer}>
                    <p>
                        &copy; 2024 Lingano. All rights reserved. SA3 project,
                        USI.
                    </p>
                </div>
            </footer>
        </>
    );
};

export default LandingPage;
