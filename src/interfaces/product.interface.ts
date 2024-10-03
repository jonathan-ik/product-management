export interface Product {
    _id?: string;
    product_name: string;
    price: number;
    description: string;
    product_image?: string;
    product_model: string;
    reviews?: { id: string; name: string; review: string }[]
  }
  