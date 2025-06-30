export interface Category{
    id: number;
    name: string;
    slug: string;
    is_gender: boolean;
}

export type NewCategory = Omit<Category, 'id' >;