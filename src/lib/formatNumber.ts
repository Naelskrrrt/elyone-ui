export const formatNumber = (number: number | string) => {
    return new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(number as number);
};
