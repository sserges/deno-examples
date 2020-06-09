import { v4 } from "https://deno.land/std/uuid/mod.ts";
import { Client } from "https://deno.land/x/postgres/mod.ts";

import { Product } from "../types.ts";
import { dbCreds } from "../config.ts";

// Init client
const client = new Client(dbCreds);

let products: Product[] = [
  {
    id: "1",
    name: "Product One",
    description: "This is product one",
    price: 29.99,
  },
  {
    id: "2",
    name: "Product Two",
    description: "This is product Two",
    price: 39.99,
  },
  {
    id: "3",
    name: "Product Three",
    description: "This is product one",
    price: 59.99,
  },
];

// @desc Get all products
// @route GET /api/v1/products
const getProducts = async ({ response }: { response: any }) => {
  try {
    await client.connect();

    const result = await client.query("SELECT * FROM products");

    const products = new Array();

    result.rows.map((p) => {
      let obj: any = new Object();

      result.rowDescription.columns.map((el, i) => {
        obj[el.name] = p[i];
      });

      products.push(obj);
    });

    response.body = {
      success: true,
      data: products,
    };
  } catch (error) {
    response.status = 500;
    response.body = {
      success: false,
      msg: error.toString(),
    };
  }
};

// @desc Get single product
// @route GET /api/v1/products/:id
const getProduct = (
  { params, response }: { params: { id: string }; response: any },
) => {
  const product: Product | undefined = products.find((p) => p.id === params.id);

  if (product) {
    response.status = 200;
    response.body = {
      success: true,
      data: product,
    };
  } else {
    response.status = 404;
    response.body = {
      success: false,
      msg: "No product found",
    };
  }
};

// @desc Add product
// @route POST /api/v1/products
const addProduct = async (
  { request, response }: { request: any; response: any },
) => {
  const body = await request.body();
  const product = body.value;

  if (!request.hasBody) {
    response.status = 400;
    response.body = {
      success: false,
      msg: "No data",
    };
  } else {
    try {
      await client.connect();

      const result = await client.query(
        "INSERT INTO products(name, description, price) VALUES($1, $2, $3)",
        product.name,
        product.description,
        product.price,
      );

      response.status = 201;
      response.body = {
        success: true,
        data: product,
      };
    } catch (error) {
      response.status = 500;
      response.body = {
        success: false,
        msg: error.toString(),
      };
    } finally {
      await client.end();
    }
  }
};

// @desc Update product
// @route PUT /api/v1/products/:id
const updateProduct = async (
  { params, request, response }: {
    params: { id: string };
    request: any;
    response: any;
  },
) => {
  const product: Product | undefined = products.find((p) => p.id === params.id);

  if (product) {
    const body = await request.body();

    const updateData: { name?: string; description?: string; price?: number } =
      body.value;
    products = products.map((p) =>
      p.id === params.id ? { ...p, ...updateData } : p
    );

    response.status = 200;
    response.body = {
      success: true,
      data: products.find((p) => p.id === params.id),
    };
  } else {
    response.status = 404;
    response.body = {
      success: false,
      msg: "No product found",
    };
  }
};

// @desc Delete product
// @route DELETE /api/v1/products/:id
const deleteProduct = (
  { params, response }: { params: { id: string }; response: any },
) => {
  products = products.filter((p) => p.id !== params.id);
  response.body = {
    success: true,
    msg: "Product removed",
  };
};

export { getProducts, getProduct, addProduct, updateProduct, deleteProduct };
