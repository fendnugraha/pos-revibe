"use client";
import StatusCard from "@/components/StatusCard";
import axios from "@/libs/axios";
import { todayDate } from "@/libs/format";
import { useCallback, useEffect, useState } from "react";

const RecentOrderStatus = () => {
    const today = todayDate();
    const [OrderList, setOrderList] = useState([]);
    const [search, setSearch] = useState("");

    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [loading, setLoading] = useState(false);
    console.log(OrderList);
    const fetchOrders = useCallback(
        async (url = "/api/orders") => {
            setLoading(true);
            try {
                const response = await axios.get(url, {
                    params: {
                        search: search,
                        start_date: startDate,
                        end_date: endDate,
                        status: "All Orders",
                        paginated: true,
                        per_page: 5,
                    },
                });
                setOrderList(response.data.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        },
        [search, startDate, endDate]
    );

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return (
        <div className="card p-4 mb-18 sm:mb-0">
            <h1 className="card-title mb-4">Recent updates</h1>
            {OrderList.orders?.data?.map((item) => (
                <StatusCard key={item.id} order={item} />
            ))}
        </div>
    );
};

export default RecentOrderStatus;
