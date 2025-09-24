import { LayoutDashboardIcon, DollarSignIcon, ChartAreaIcon, CogIcon, BoxesIcon, CoinsIcon, WrenchIcon } from "lucide-react";

export const navMenu = {
    mainMenu: [
        // { name: "Dashboard", path: "/dashboard", href: "/dashboard", icon: LayoutDashboardIcon, role: ["Administrator", "Cashier", "Staff"] },
        { name: "Service", path: "/order", href: "/order", icon: WrenchIcon, role: ["Administrator", "Cashier", "Staff", "Technician"] },
        { name: "Cash & Bank", path: "/cashbank", href: "/cashbank", icon: CoinsIcon, role: ["Administrator", "Cashier", "Staff", "Technician"] },
        { name: "Inventory", path: "/inventory", href: "/inventory", icon: BoxesIcon, role: ["Administrator", "Cashier"] },
        { name: "Finance", path: "/finance", href: "/finance", icon: DollarSignIcon, role: ["Administrator", "Cashier", "Technician"] },
        { name: "Summary", path: "/summary", href: "/summary", icon: ChartAreaIcon, role: ["Administrator"] },
        { name: "Settings", path: "/setting", href: "/setting", icon: CogIcon, role: ["Administrator"] },
    ],
    settings: [{ name: "Settings", path: "/setting", href: "/setting", icon: CogIcon, role: ["Administrator"] }],
};
