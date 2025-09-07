"use client";
import Notification from "@/components/Notification";
import MainPage from "../../main";
import { useCallback, useEffect, useState } from "react";
import { MessageCircleWarningIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon } from "lucide-react";
import Button from "@/components/Button";
import axios from "@/libs/axios";
import CreateContact from "./CreateContact";
import Modal from "@/components/Modal";
import Paginator from "@/components/Paginator";
import UpdateContact from "./UpdateContact";

const Contact = () => {
    const [contacts, setContacts] = useState(null);
    const [contactCategories, setContactCategories] = useState([]);
    const [selectedContact, setSelectedContact] = useState([]);
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [errors, setErrors] = useState([]); // Store validation errors

    const [isModalCreateContactOpen, setIsModalCreateContactOpen] = useState(false);
    const [isModalCreateCategoryContactOpen, setIsModalCreateCategoryContactOpen] = useState(false);
    const [isModalUpdateContactOpen, setIsModalUpdateContactOpen] = useState(false);
    const [isModalDeleteContactOpen, setIsModalDeleteContactOpen] = useState(false);

    const closeModal = () => {
        setIsModalCreateContactOpen(false);
        setIsModalCreateCategoryContactOpen(false);
        setIsModalUpdateContactOpen(false);
        setIsModalDeleteContactOpen(false);
        // setIsModalUpdateAccountOpen(false)
    };

    const fetchContacts = useCallback(
        async (url = "/api/contacts") => {
            setLoading(true);
            try {
                const response = await axios.get(url, {
                    params: {
                        search: search,
                    },
                });
                setContacts(response.data.data);
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
            fetchContacts();
        }, 500);
        return () => clearTimeout(timeout);
    }, [fetchContacts]);
    const handleChangePage = (url) => {
        fetchContacts(url);
    };

    const handleDeleteContact = async (id) => {
        try {
            const response = await axios.delete(`/api/contacts/${id}`);
            setNotification({
                type: "success",
                message: response.data.message,
            });
            fetchContacts();
        } catch (error) {
            setNotification({
                type: "error",
                message: error.response?.data?.message || "Delete failed",
            });
        }
    };

    const findSelectedAccountId = contacts?.data?.find((contact) => contact.id === selectedContactId);
    return (
        <MainPage headerTitle="Contact">
            <div className="p-8">
                {notification.message && (
                    <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
                )}
                <div className="flex gap-2 mb-4">
                    <Button buttonType="primary" onClick={() => setIsModalCreateContactOpen(true)} className={`flex item-center gap-2`}>
                        <PlusIcon size={20} /> Add Contact
                    </Button>
                    <Modal isOpen={isModalCreateContactOpen} onClose={closeModal} modalTitle="Create Contact" maxWidth={"max-w-lg"}>
                        <CreateContact
                            isModalOpen={setIsModalCreateContactOpen}
                            notification={(type, message) => setNotification({ type, message })}
                            fetchContacts={fetchContacts}
                        />
                    </Modal>
                </div>
                <div className="relative w-full sm:max-w-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="w-6 h-6 text-gray-500" />
                    </div>
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="block w-full text-sm mb-2 pl-10 pr-4 py-2 text-gray-900 placeholder-gray-400 bg-white rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        autoComplete="off"
                    />
                </div>
                <div className="overflow-x-auto bg-white rounded-2xl w-full sm:w-3/4 drop-shadow-sm">
                    <table className="table w-full text-sm">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts?.data?.map((contact) => (
                                <tr key={contact.id}>
                                    <td>
                                        {contact.name}
                                        <span className="block text-xs text-gray-400">{contact.type}</span>
                                    </td>
                                    <td>
                                        {contact.phone_number}
                                        <span className="block text-xs text-gray-400">
                                            {contact.description} | {contact.address}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedContactId(contact.id);
                                                    setIsModalUpdateContactOpen(true);
                                                }}
                                                className="cursor-pointer hover:scale-125 transition transform ease-in"
                                            >
                                                <PencilIcon className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedContactId(contact.id);
                                                    setIsModalDeleteContactOpen(true);
                                                }}
                                                className="cursor-pointer hover:scale-125 transition transform ease-in"
                                            >
                                                <TrashIcon className="size-4" />
                                            </button>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-4">{contacts?.last_page > 1 && <Paginator links={contacts} handleChangePage={handleChangePage} />}</div>
                </div>
            </div>
            <Modal isOpen={isModalUpdateContactOpen} onClose={closeModal} modalTitle="Update Contact" maxWidth="max-w-md">
                <UpdateContact
                    isModalOpen={setIsModalUpdateContactOpen}
                    notification={(type, message) => setNotification({ type, message })}
                    fetchContacts={fetchContacts}
                    contact={findSelectedAccountId}
                />
            </Modal>
            <Modal isOpen={isModalDeleteContactOpen} onClose={closeModal} modalTitle="Confirm Delete" maxWidth="max-w-md">
                <div className="flex flex-col items-center justify-center gap-3 mb-4">
                    <MessageCircleWarningIcon size={72} className="text-red-600" />
                    <p className="text-sm">Apakah anda yakin ingin menghapus contact ini (ID: {selectedContactId})?</p>
                </div>
                <div className="flex justify-center gap-3">
                    <Button
                        buttonType="neutral"
                        onClick={() => {
                            handleDeleteContact(selectedContactId);
                            setIsModalDeleteContactOpen(false);
                        }}
                    >
                        Ya
                    </Button>
                    <Button buttonType="danger" onClick={() => setIsModalDeleteContactOpen(false)}>
                        Tidak
                    </Button>
                </div>
            </Modal>
        </MainPage>
    );
};

export default Contact;
