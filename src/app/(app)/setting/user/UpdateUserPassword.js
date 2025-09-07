import Button from "@/components/Button";
import Input from "@/components/Input";
import axios from "@/libs/axios";
import { useState } from "react";

const UpdateUserPassword = ({ isModalOpen, notification, fetchUsers, findSelectedAccountId }) => {
    const id = findSelectedAccountId?.id;

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [updatePassword, setUpdatePassword] = useState({
        oldPassword: "",
        password: "",
        confirmPassword: "",
    });

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`/api/users/${id}/update-password`, updatePassword);
            notification("success", response.data.message);
            isModalOpen(false);
            fetchUsers();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification("error", error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form>
            <h1>User: {findSelectedAccountId?.name}</h1>
            <div className="my-4">
                <label>Old Password</label>
                <Input
                    className={"w-full"}
                    type="password"
                    onChange={(e) => setUpdatePassword({ ...updatePassword, oldPassword: e.target.value })}
                    value={updatePassword.oldPassword}
                />
            </div>
            <div className="mb-4">
                <label>New Password</label>
                <Input
                    className={"w-full"}
                    type="password"
                    onChange={(e) => setUpdatePassword({ ...updatePassword, password: e.target.value })}
                    value={updatePassword.password}
                />
            </div>
            <div className="mb-4">
                <label>Confirm Password</label>
                <Input
                    className={"w-full"}
                    type="password"
                    onChange={(e) => setUpdatePassword({ ...updatePassword, confirmPassword: e.target.value })}
                    value={updatePassword.confirmPassword}
                />
            </div>
            <div className="flex justify-end">
                <Button buttonType="success" onClick={handleUpdatePassword} disabled={loading} className={`${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
                    {loading ? "Loading..." : "Update Password"}
                </Button>
            </div>
        </form>
    );
};

export default UpdateUserPassword;
