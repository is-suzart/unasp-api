export class Community {
    id: string;
    name: string;
    slug: string;
    type: string;
    logoUrl?: string;
    isActive: boolean;
    seo: {
        title: string;
        description: string;
        ogImage?: string;
    };
    menu?: Menu;
    pages?: Page[];

    constructor(props: Partial<Community>) {
        Object.assign(this, props);
    }
}

export class Menu {
    id: string;
    communityId: string;
    items: MenuItem[];

    constructor(props: Partial<Menu>) {
        Object.assign(this, props);
    }
}

export interface MenuItem {
    label: string;
    url: string;
    order: number;
    children?: MenuItem[];
}

export class Page {
    id: string;
    communityId: string;
    title: string;
    slug: string;
    content: PageVisuals; // JSONB for PC-4 Cards/Sections

    constructor(props: Partial<Page>) {
        Object.assign(this, props);
    }
}

export interface PageVisuals {
    [key: string]: any; // Flexible JSON structure
}
