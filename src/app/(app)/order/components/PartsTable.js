import formatNumber from "@/libs/formatNumber";

const PartsTable = ({ parts, totalPrice }) => {
    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-xs table">
                    <thead>
                        <tr>
                            <th className="">Nama Part</th>
                            <th className="">Jumlah</th>
                            <th className="w-16">Harga</th>
                            <th className="">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parts?.stock_movements?.length > 0 ? (
                            parts?.stock_movements?.map((part, index) => (
                                <tr key={index}>
                                    <td className="">{part.product?.name}</td>
                                    <td className="text-center">{formatNumber(-part.quantity)}</td>
                                    <td className="text-right">{formatNumber(part.price)}</td>
                                    <td className="text-right">{formatNumber(part.price * -part.quantity)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center">
                                    Tidak ada pergantian sparepart
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {parts?.stock_movements?.length > 0 && (
                        <tfoot>
                            <tr>
                                <th></th>
                                <th className="text-right" colSpan="2">
                                    Total
                                </th>
                                <th className="text-right">{formatNumber(totalPrice)}</th>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </>
    );
};

export default PartsTable;
