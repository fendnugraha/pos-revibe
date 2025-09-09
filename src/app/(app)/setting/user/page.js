"use client";
import Notification from "@/components/Notification";
import MainPage from "../../main";
import { MailIcon, MessageCircleWarningIcon, PencilIcon, PlusIcon, RectangleEllipsisIcon, SearchIcon, TrashIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Button from "@/components/Button";
import Paginator from "@/components/Paginator";
import Link from "next/link";
import axios from "@/libs/axios";
import TimeAgo from "@/libs/formatDateDistance";
import Modal from "@/components/Modal";
import CreateUser from "./CreateUser";
import UpdateUser from "./UpdateUser";
import UpdateUserPassword from "./UpdateUserPassword";
import Breadcrumb from "@/components/Breadcrumb";

const User = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [errors, setErrors] = useState([]); // Store validation errors
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isModalCreateUserOpen, setIsModalCreateUserOpen] = useState(false);
    const [isModalUpdateUserOpen, setIsModalUpdateUserOpen] = useState(false);
    const [isModalUpdateUserPasswordOpen, setIsModalUpdateUserPasswordOpen] = useState(false);
    const [isModalDeleteUserOpen, setIsModalDeleteUserOpen] = useState(false);

    const closeModal = () => {
        setIsModalCreateUserOpen(false);
        setIsModalUpdateUserOpen(false);
        setIsModalDeleteUserOpen(false);
        setIsModalUpdateUserPasswordOpen(false);
    };

    const fetchUsers = useCallback(
        async (url = "/api/users") => {
            setLoading(true);
            try {
                const response = await axios.get(url, {
                    params: {
                        search: search,
                    },
                });
                setUsers(response.data.data);
            } catch (error) {
                setNotification("error", error.response?.data?.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        },
        [search]
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timeout);
    }, [search, fetchUsers]);

    const handleChangePage = (url) => {
        fetchUsers(url);
    };

    const handleDeleteUser = async (id) => {
        try {
            const response = await axios.delete(`/api/users/${id}`);
            setNotification(response.data.message);
            fetchUsers();
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
        }
    };

    const findSelectedAccountId = users.data?.find((user) => user.id === selectedUserId);

    return (
        <>
            <Breadcrumb
                BreadcrumbArray={[
                    { name: "Setting", href: "/setting" },
                    { name: "User Management", href: "/setting/user" },
                ]}
            />
            <div className="px-6 py-4">
                {notification.message && (
                    <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
                )}
                <div className="flex gap-2 mb-4">
                    <Button buttonType="primary" onClick={() => setIsModalCreateUserOpen(true)} className={`flex item-center gap-2`}>
                        <PlusIcon size={20} /> Add User
                    </Button>
                    <Modal isOpen={isModalCreateUserOpen} onClose={closeModal} modalTitle="Create User">
                        <CreateUser
                            isModalOpen={setIsModalCreateUserOpen}
                            notification={(type, message) => setNotification({ type, message })}
                            fetchUsers={fetchUsers}
                        />
                    </Modal>
                </div>
                <div className="card p-4">
                    <h1 className="card-title mb-4">User List</h1>
                    <div className="relative w-full sm:max-w-sm">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-6 h-6 text-gray-500" />
                        </div>
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="block w-full text-sm mb-2 pl-10 pr-4 py-2 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            autoComplete="off"
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table w-full text-xs">
                            <thead>
                                <tr>
                                    <th className="">Name</th>
                                    <th className="">Role</th>
                                    <th className="">Warehouse</th>
                                    <th className="">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td className="text-center" colSpan={3}>
                                            Loading ...
                                        </td>
                                    </tr>
                                ) : (
                                    users?.data?.map((user) => (
                                        <tr key={user.id}>
                                            <td className="">
                                                <span className="text-sm font-bold">{user.name}</span>
                                                <span className="block">
                                                    <MailIcon className="h-4 w-4 inline" /> {user.email}
                                                </span>
                                                <span className="block text-slate-500">
                                                    Last update at <TimeAgo timestamp={user.updated_at} />
                                                </span>
                                            </td>
                                            <td className="text-center">{user.role?.role}</td>
                                            <td className="text-center">{user.role?.warehouse?.name}</td>
                                            <td className="text-center">
                                                <span className="flex gap-2 justify-center items-center">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUserId(user.id);
                                                            setIsModalUpdateUserOpen(true);
                                                        }}
                                                        className="cursor-pointer hover:scale-125 transition transform ease-in"
                                                    >
                                                        <PencilIcon className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUserId(user.id);
                                                            setIsModalUpdateUserPasswordOpen(true);
                                                        }}
                                                        className="cursor-pointer hover:scale-125 transition transform ease-in"
                                                    >
                                                        <RectangleEllipsisIcon className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUserId(user.id);
                                                            setIsModalDeleteUserOpen(true);
                                                        }}
                                                        className="cursor-pointer hover:scale-125 transition transform ease-in"
                                                    >
                                                        <TrashIcon className="size-4" />
                                                    </button>
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <div className="px-4">{users?.last_page > 1 && <Paginator links={users} handleChangePage={handleChangePage} />}</div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalUpdateUserOpen} onClose={closeModal} modalTitle="Update User" maxWidth="max-w-md">
                <UpdateUser
                    isModalOpen={setIsModalUpdateUserOpen}
                    notification={(type, message) => setNotification({ type, message })}
                    fetchUsers={fetchUsers}
                    findSelectedAccountId={findSelectedAccountId}
                />
            </Modal>
            <Modal isOpen={isModalUpdateUserPasswordOpen} onClose={closeModal} modalTitle="Update User Password" maxWidth="max-w-md">
                <UpdateUserPassword
                    isModalOpen={setIsModalUpdateUserPasswordOpen}
                    notification={(type, message) => setNotification({ type, message })}
                    fetchUsers={fetchUsers}
                    findSelectedAccountId={findSelectedAccountId}
                />
            </Modal>
            <Modal isOpen={isModalDeleteUserOpen} onClose={closeModal} modalTitle="Confirm Delete" maxWidth="max-w-md">
                <div className="flex flex-col items-center justify-center gap-3 mb-4">
                    <MessageCircleWarningIcon size={72} className="text-red-600" />
                    <p className="text-sm">Apakah anda yakin ingin menghapus user ini (ID: {selectedUserId})?</p>
                </div>
                <div className="flex justify-center gap-3">
                    <Button
                        buttonType="neutral"
                        onClick={() => {
                            handleDeleteUser(selectedUserId);
                            setIsModalDeleteUserOpen(false);
                        }}
                    >
                        Ya
                    </Button>
                    <Button buttonType="danger" onClick={() => setIsModalDeleteUserOpen(false)}>
                        Tidak
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default User;
