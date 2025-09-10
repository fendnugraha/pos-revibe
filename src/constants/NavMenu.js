import { LayoutDashboardIcon, ArrowLeftRightIcon, ScaleIcon, DollarSignIcon, ChartAreaIcon, CogIcon, BoxesIcon, CoinsIcon } from "lucide-react";

export const navMenu = {
    mainMenu: [
        // { name: "Dashboard", path: "/dashboard", href: "/dashboard", icon: LayoutDashboardIcon, role: ["Administrator", "Cashier", "Staff"] },
        { name: "Order", path: "/order", href: "/order", icon: ArrowLeftRightIcon, role: ["Administrator", "Cashier", "Staff"] },
        { name: "Cash & Bank", path: "/cashbank", href: "/cashbank", icon: CoinsIcon, role: ["Administrator", "Cashier", "Staff"] },
        // { name: "Inventory", path: "/inventory", href: "/inventory", icon: BoxesIcon, role: ["Administrator"] },
        { name: "Finance", path: "/finance", href: "/finance", icon: DollarSignIcon, role: ["Administrator", "Staff"] },
        { name: "Summary", path: "/summary", href: "/summary", icon: ChartAreaIcon, role: ["Administrator"] },
        { name: "Settings", path: "/setting", href: "/setting", icon: CogIcon, role: ["Administrator"] },
    ],
    settings: [{ name: "Settings", path: "/setting", href: "/setting", icon: CogIcon, role: ["Administrator", "Cashier", "Staff"] }],
};
