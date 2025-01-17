import { Card } from "@/components/ui/card";

// import ShadcnKit from "@/components/icons/shadcn-kit";
// import { nanoid } from "nanoid";
// import Link from "next/link";

const Navbar = () => {
    return (
        <Card className="bg-card py-3 px-4 border-0 flex items-center justify-between gap-6 rounded-2xl sticky top-0">
            <img
                src="https://www.elyone.com/hubfs/Design%20sans%20titre%20(77).svg"
                alt="logo elyone"
                className="h-10 w-26 pointer-events-none"
            />
        </Card>
    );
};

export default Navbar;
