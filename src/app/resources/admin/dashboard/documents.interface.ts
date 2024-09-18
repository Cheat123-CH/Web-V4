export interface DocumentData {
    data: DocumentData[];
}

export interface DocumentData {
    id: number;
    doc_number: string;
    title: string;
    abbre_org: string;
    created_at: string;
    n_of_documents: string;
    total_doc_size: string | null;
    docCategory: DocCategory;
    docStatus: DocStatus;
    doc_ministrys: DocMinistry[];
    creator: Creator;
}

export interface DocCategory {
    id: number;
    name: string;
}

export interface DocStatus {
    id: number;
    kh_name: string;
    en_name: string;
    color: string;
}

export interface DocMinistry {
    id: number;
    ministrys: Ministry;
}

export interface Ministry {
    id: number;
    logo: string;
    abbre: string;
}

export interface Creator {
    id: number;
    avatar: string;
    kh_name: string;
}
