import { Route, Routes, useLocation } from "react-router-dom";
import MainPage from "./pages/Main";
import ImportPage from "./pages/Import";
import ReadingPage from "./pages/Reading";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import AdminPanelPage from "./pages/AdminPanel";
import Settings from "./pages/Settings";
import FlashcardsPage from "./pages/FlashcardsPage";
import LandingPage from "./pages/LandingPage";
import PublicProfile from "./pages/PublicProfile";
import Navbar from "./components/NavBar";
import { useEffect, useState } from "react";
import api from "./utils/api";
import { User } from "./interfaces/Users";

const Page = () => {
    const [user, setUser] = useState<User | undefined>(undefined);
    const location = useLocation();

    useEffect(() => {
        api.fetchCurrentUserData()
            .then((user) => {
                // console.log("User data:", user);
                if (user) {
                    setUser(user);
                }
            })
            .catch((error) => console.error("Error:", error));
    }, []);

    const showNavbar = !["/", "/login", "/register"].includes(
        location.pathname
    );

    return (
        <>
            {showNavbar && <Navbar user={user} setUser={setUser}></Navbar>}
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/import" element={<ImportPage />} />
                <Route path="/reading" element={<ReadingPage />} />
                <Route
                    path="/login"
                    element={<LoginPage setUser={setUser} />}
                />
                <Route
                    path="/register"
                    element={<RegisterPage setUser={setUser} />}
                />
                <Route path="/word" element={<FlashcardsPage />} />
                <Route path="/admin" element={<AdminPanelPage />} />
                <Route
                    path="/settings"
                    element={user && <Settings user={user} setUser={setUser} />}
                />
                <Route path="/profile/:username" element={<PublicProfile />} />
            </Routes>
        </>
    );
};

export default Page;
