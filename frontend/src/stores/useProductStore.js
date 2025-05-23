import { create } from "zustand";
import axios from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useProductStore = create((set) => ({
    products: [],
    loading: false,

    createProduct: async (productData) => {
        set({loading: true});
        try {
            const res = await axios.post("/products", productData);
            set((prevState) => ({
                products: [...prevState.products, res.data],
                loading: false  
            }))
            toast.success("Product created successfully");
        } catch (error) {
            set({loading: false});
            toast.error(error.response.data.error || "Failed to create product");
        }
    },
    fetchAllProducts: async () => {
        set({loading: true});
        try {
            const res = await axios.get("/products");
            set({products: res.data.products, loading: false});
        } catch (error) {
            set({loading: false});
            toast.error(error.response.data.error || "Failed to fetch products");
        }
    },

    fetchProductsByCategory: async (category) => {
        set({loading: true});
        try {
            const res = await axios.get(`/products/category/${category}`);
            set({products: res.data.products, loading: false});
        } catch (error) {
            set({loading: false});
            toast.error(error.response.data.error || "Failed to fetch products");
        }
    },

    deleteProduct: async (productId) => {
        set({loading: true});
        try {
            await axios.delete(`/products/${productId}`);
            set((prevProducts) => ({
                products: prevProducts.products.filter((product) => product._id !== productId),
                loading: false
            }));
            toast.success("Product deleted successfully");

        } catch (error) {
            set({loading: false});
            toast.error(error.response.data.error || "Failed to delete product");
        }
        
    },
    toggleFeaturedProduct: async (productId) => {

        set({ loading: true });
		try {
			const response = await axios.patch(`/products/${productId}`);
			// this will update the isFeatured prop of the product
			set((prevProducts) => ({
				products: prevProducts.products.map((product) =>
					product._id === productId ? { ...product, isFeatured: response.data.isFeatured } : product
				),
				loading: false,
			}));
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.error || "Failed to update product");
		}

    },
    fetchFeaturedProducts: async () => {
        set({loading: true});
        try {
            const res = await axios.get("/products/featured");
            console.log(res.data);
            set({products: res.data, loading: false});
        } catch (error) {
            set({error: "Failed to fetch featured products", loading: false});
            console.log("Error in fetchFeaturedProducts",error);
        }
    }
}));