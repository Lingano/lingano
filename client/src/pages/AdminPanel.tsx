import React from "react";
import { Helmet } from "react-helmet";
import api from "../utils/api";
import { User } from "../interfaces/Users";
import styles from "./AdminPanel.module.css";

const AdminPanelPage: React.FC = () => {
    const [users, setUsers] = React.useState<User[]>([]);

    React.useEffect(() => {
        api.fetchUsersForAdmin().then((fetchedUsers: User[]) => {
            setUsers(fetchedUsers);
        });
    }, []);

    return (
        <>
            <Helmet title="Admin Panel" />
            <div className={styles.adminPanel}>
                <div className={styles.adminPanelHeader}>Admin Panel</div>
                <div className={styles.adminPanelContent}>
                    <p>
                        Welcome to the admin panel. Here you can manage users,
                        view reports, and configure settings.
                    </p>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>God Mode</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user: User, index) => (
                                <tr key={index}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        {user.god_mode ? <b>True</b> : "False"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className={styles.adminPanelFooter}>
                    © 2023 Admin Panel
                </div>
            </div>
        </>
    );
};

export default AdminPanelPage;
