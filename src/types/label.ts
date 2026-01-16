export interface CompanyGroup {
    id: number;
    name: string;
    group: {
        id: number;
        name: string;
    };
}

export interface Label {
    id: number;
    name: string;
    company_group: CompanyGroup;
}

