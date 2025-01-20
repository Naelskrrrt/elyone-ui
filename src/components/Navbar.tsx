import { Card } from "@/components/ui/card";
import { Link, useLocation } from "react-router";
import { Button } from "./ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";

// import ShadcnKit from "@/components/icons/shadcn-kit";
// import { nanoid } from "nanoid";
// import Link from "next/link";

const Navbar = () => {
    const where = useLocation();

    console.log(where);

    return (
        <Card className="bg-card py-3 w-full px-4 border-0 flex items-center justify-between gap-6 sticky top-0">
            <img
                src="https://www.elyone.com/hubfs/Design%20sans%20titre%20(77).svg"
                alt="logo elyone"
                className="h-10 w-26 pointer-events-none"
            />

            {where.pathname === "/addArticle" && (
                <Link to={"/"}>
                    <Button variant={"link"}>
                        {" "}
                        <Icon icon={"solar:arrow-left-linear"} />
                        Liste des Commandes
                    </Button>
                </Link>
            )}
        </Card>
    );
};

export default Navbar;
