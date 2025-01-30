import GenericTable from "@/components/CommandeTable/GenericTable";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { useUrlParams } from "@/context/UrlParamsContext";
import { useArticleHistory } from "@/hooks/useArticles";
import { ArticleHistory } from "@/types/Article";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import "dayjs/locale/fr"; // Charger la locale française
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/formatNumber";

export function ArticleHistoryDialog({
    reference,
    designation,
}: {
    reference?: string;
    designation?: string;
}) {
    const [open, setOpen] = useState(false);

    const { params } = useUrlParams();
    const { data: articleHistory, isLoading } = useArticleHistory({
        reference: reference as string,
        ct_num: params?.ct_num as string,
        hubspot_id: params?.hubspot_id as string,
        deal_id: params?.deal_id as string,
    });

    dayjs.extend(localizedFormat);
    dayjs.locale("fr");

    const columns = useMemo<ColumnDef<ArticleHistory>[]>(
        // Designation, remise finale, prix finale = prix net
        () => [
            {
                id: "date_achat",
                accessorKey: "date_achat",
                header: "Date d'achat",
                cell: ({ row }) => {
                    const formattedDate = dayjs(row.original.date_achat).format(
                        "DD MMM YYYY"
                    );

                    return <span>{formattedDate}</span>;
                },
                size: 300,
            },
            {
                id: "numero_document",
                accessorKey: "numero_document",
                header: "N° de document",
                cell: (info) => info.getValue(),
                size: 350,
            },
            {
                id: "prix_achat",
                accessorKey: "prix_achat",
                header: "Prix Achat",
                cell: (info) =>
                    formatNumber(
                        parseFloat(info.getValue() as string).toFixed(2)
                    ) + " €",
                size: 200,
            },
            {
                id: "remise",
                accessorKey: "remise",
                header: "Remise",
                cell: (info) =>
                    formatNumber(
                        parseFloat(info.getValue() as string).toFixed(2)
                    ) + " %",
                size: 200,
            },
        ],
        []
    );

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button
                    // variant="outline"
                    size={"icon"}
                    className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:text-yellow-700"
                >
                    <Icon
                        icon={"ph:list-magnifying-glass"}
                        height={24}
                        width={24}
                        className="font-bold text-xl"
                    />
                </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[60%] p-2">
                <DrawerHeader className="text-left">
                    <DrawerTitle>Historique par Article</DrawerTitle>
                    <DrawerDescription>
                        Historique pour{" "}
                        <span className="text-nextblue-500 font-semibold">
                            {designation}{" "}
                        </span>
                    </DrawerDescription>
                </DrawerHeader>
                {/* <div className="w-full"> */}
                <GenericTable
                    dataId={[]}
                    isLoading={isLoading}
                    handleFilterChange={() => {}}
                    columns={columns}
                    data={articleHistory?.data}
                    handleSort={() => {}}
                    isSortable={false}
                />
                {/* </div> */}
                <DrawerFooter className="pt-2"></DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
