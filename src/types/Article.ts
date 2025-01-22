// types/Article.ts
export interface Article {
    reference_article?: string; //
    designation_article?: string; //
    code_famille?: string; //
    prix_vente?: string; //
    prix_ttc?: string; //
    mise_en_sommeil?: number; //
    dernier_prix_achat?: string; //
    prix_achat1?: string;
    remise_client?: string | null;
    categorie_article?: string | null;
    remise_categorie?: string | null;
    remise_famille?: string | null;
    stock?: number | null;
    Qtecommandeclient?: number | null;
    QtecommandeAchat?: number | null;
    prix_vente_client?: string | null;
    categorie_client?: string | null;
    CL_No1?: number;
    CL_No2?: number;
    CL_No3?: number;
    CL_No4?: number;
    marque_commerciale?: string | null;
    objectif_qtes_vendues?: number | null;
    pourcentage_or?: number | null;
    premiere_commercialisation?: string | null;
    AR_Exclure?: number;
    AR_InterdireCommande?: number;
    dossier_hs?: string;
    equivalent_75?: string | null;
    ref_bis: string | null;
    catalogue1_intitule?: string | null;
    catalogue2_intitule?: string | null;
    catalogue3_intitule?: string | null;
    catalogue4_intitule?: string | null;
    numero_document?: string | null;
    date_achat?: string | null;
    quantite_achat?: number | null;
    prix_achat?: string | null;
    prix_final?: string;
    remise_finale?: string;
    prix_net?: string;
    AR_StockTerme?: string | null;
}

export type FetchArticlesParams = {
    deal_id: string;
    hubspot_id: string;
    ct_num: string;
    filter?: { [key: string]: string };
    search?: string;
    page?: number;
    per_page?: number;
    sqlOrder?: { [key: string]: "ASC" | "DESC" };
};

export interface FetchArticlesResponse {
    articles: Article[];
    total: number;
    empty_columns: { [key: string]: string };
}
