"use client";
import Notification from "@/components/Notification";
import MainPage from "../../main";
import { useCallback, useEffect, useState } from "react";
import Button from "@/components/Button";
import { LockIcon, MessageCircleWarningIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon } from "lucide-react";
import Modal from "@/components/Modal";
import CreateAccount from "./CreateAccount";
import axios from "@/libs/axios";
import Paginator from "@/components/Paginator";
import Input from "@/components/Input";
import formatNumber from "@/libs/formatNumber";
import { set } from "date-fns";
import UpdateAccount from "./UpdateAccount";

const Account = () => {
    const [account, setAccount] = useState(null);
    const [categoryAccount, setCategoryAccount] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]); // Store validation errors
    const [isModalCreateAccountOpen, setIsModalCreateAccountOpen] = useState(false);
    const [isModalUpdateAccountOpen, setIsModalUpdateAccountOpen] = useState(false);
    const [isModalDeleteAccountOpen, setIsModalDeleteAccountOpen] = useState(false);
    const [notification, setNotification] = useState({ type: "", message: "" });

    const closeModal = () => {
        setIsModalCreateAccountOpen(false);
        setIsModalUpdateAccountOpen(false);
    };

    const fetchAccount = useCallback(
        async (url = "/api/accounts") => {
            setLoading(true);
            try {
                const response = await axios.get(url, {
                    params: {
                        search: searchTerm,
                    },
                });
                setAccount(response.data.data);
            } catch (error) {
                setErrors(error.response?.data?.errors || ["Something went wrong."]);
            } finally {
                setLoading(false);
            }
        },
        [searchTerm]
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchAccount();
        }, 500);

        return () => clearTimeout(timeout);
    }, [fetchAccount, searchTerm]);

    const handleChangePage = (url) => {
        fetchAccount(url);
    };

    const handleSelectAccount = (id) => {
        setSelectedAccount((prevSelected) => {
            // Check if the ID is already in the selectedAccount array
            if (prevSelected.includes(id)) {
                // If it exists, remove it
                return prevSelected.filter((accountId) => accountId !== id);
            } else {
                // If it doesn't exist, add it
                return [...prevSelected, id];
            }
        });
    };

    const handleDeleteAccount = async (id) => {
        try {
            const response = await axios.delete(`api/accounts/${id}`);
            setNotification({
                type: "success",
                message: response.data.message,
            });
            fetchAccount();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            setNotification({
                type: "error",
                message: error.response?.data?.message || "Delete failed",
            });
        }
    };

    const fetchCategoryAccount = useCallback(async () => {
        try {
            const response = await axios.get("api/category-accounts");
            setCategoryAccount(response.data.data);
        } catch (error) {
            setErrors(error.response?.message || ["Something went wrong."]);
        }
    }, []);

    useEffect(() => {
        fetchCategoryAccount();
    }, [fetchCategoryAccount]);

    const findSelectedAccountId = account?.data?.find((item) => item.id === selectedAccountId);

    return (
        <MainPage headerTitle="Chart of Account">
            <div className="p-8">
                {notification.message && (
                    <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
                )}
                <div className="flex gap-2 mb-4">
                    <Button buttonType="primary" onClick={() => setIsModalCreateAccountOpen(true)} className={`flex item-center gap-2`}>
                        <PlusIcon size={20} /> Add Account
                    </Button>
                    <Modal isOpen={isModalCreateAccountOpen} onClose={closeModal} modalTitle="Create account" maxWidth="max-w-lg">
                        <CreateAccount
                            isModalOpen={setIsModalCreateAccountOpen}
                            notification={(type, message) => setNotification({ type, message })}
                            fetchAccount={fetchAccount}
                            categoryAccount={categoryAccount}
                        />
                    </Modal>
                </div>
                <div className="relative w-full sm:max-w-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="w-6 h-6 text-gray-500" />
                    </div>
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        className="block w-full text-sm mb-2 pl-10 pr-4 py-2 text-gray-900 placeholder-gray-400 bg-white rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        autoComplete="off"
                    />
                </div>
                <div className="overflow-x-auto bg-white rounded-2xl w-full sm:w-3/4 drop-shadow-sm">
                    <table className="table w-full text-xs">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Init. Balance</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {account?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan="6">No products found</td>
                                </tr>
                            ) : (
                                account?.data?.map((coa) => (
                                    <tr key={coa.id}>
                                        <td>
                                            <span className="font-bold text-blue-800">
                                                ID: {coa.id}. {coa.acc_name} {coa.is_locked === 1 && <LockIcon size={16} className="inline" />}
                                            </span>
                                            <br />
                                            <span className="text-slate-600">
                                                {coa.acc_code} # {coa.account?.name} # {coa?.warehouse?.name ?? "NotAssociated"}
                                            </span>
                                            <span className="font-bold block text-sm sm:hidden">{formatNumber(coa.st_balance)}</span>
                                        </td>
                                        <td className="text-end text-lg">{formatNumber(coa.st_balance)}</td>
                                        <td className="text-center">
                                            <span className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => {
                                                        setSelectedAccountId(coa.id);
                                                        setIsModalUpdateAccountOpen(true);
                                                    }}
                                                    className="cursor-pointer hover:scale-125 transition transform ease-in"
                                                >
                                                    <PencilIcon className="w-5 h-5 inline" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedAccountId(coa.id);
                                                        setIsModalDeleteAccountOpen(true);
                                                    }}
                                                    className="disabled:text-red-400 cursor-pointer hover:scale-125 transition transform ease-in"
                                                    disabled={coa.is_locked === 1}
                                                >
                                                    {" "}
                                                    {coa.is_locked === 1 ? <LockIcon className="w-5 h-5 inline" /> : <TrashIcon className="w-5 h-5 inline" />}
                                                </button>
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    <div className="px-4">{account?.last_page > 1 && <Paginator links={account} handleChangePage={handleChangePage} />}</div>
                </div>
            </div>
            <Modal isOpen={isModalUpdateAccountOpen} onClose={closeModal} modalTitle="Update account" maxWidth="max-w-lg">
                <UpdateAccount
                    isModalOpen={setIsModalUpdateAccountOpen}
                    notification={(type, message) => setNotification({ type, message })}
                    fetchAccount={fetchAccount}
                    findSelectedAccountId={findSelectedAccountId}
                />
            </Modal>
            <Modal isOpen={isModalDeleteAccountOpen} onClose={closeModal} modalTitle="Confirm Delete" maxWidth="max-w-md">
                <div className="flex flex-col items-center justify-center gap-3 mb-4">
                    <MessageCircleWarningIcon size={72} className="text-red-600" />
                    <p className="text-sm">Apakah anda yakin ingin menghapus account ini (ID: {selectedAccountId})?</p>
                </div>
                <div className="flex justify-center gap-3">
                    <Button
                        buttonType="neutral"
                        onClick={() => {
                            handleDeleteAccount(selectedAccountId);
                            setIsModalDeleteAccountOpen(false);
                        }}
                    >
                        Ya
                    </Button>
                    <Button buttonType="danger" onClick={() => setIsModalDeleteAccountOpen(false)}>
                        Tidak
                    </Button>
                </div>
            </Modal>
        </MainPage>
    );
};

export default Account;
