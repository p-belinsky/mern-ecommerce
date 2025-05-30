import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json({products});
    } catch (error) {
        console.log("Error in getAllProductsController", error.message);
        res.status(500).json({message: error.message});
    }
}   

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featured_products");
        if(featuredProducts) {
            return res.status(200).json(JSON.parse(featuredProducts));
        } 

        featuredProducts = await Product.find({isFeatured: true}).lean();

        if(!featuredProducts) {
            return res.status(404).json({message: "No featured products found"});
        }

        await redis.set("featured_products", JSON.stringify(featuredProducts));
        res.status(200).json(featuredProducts);

    } catch (error) {
        console.log("Error in getFeaturedProductsController", error.message);
        res.status(500).json({message: error.message});
    }
}

export const createProduct = async (req, res) => {
    try {
        const {name, description, price, image, category} = req.body;

        let cloudinaryResponse = null;
        if(image){
            cloudinaryResponse = await cloudinary.uploader.upload(image,{folder: "products"})
            
        }

        const product = await Product.create({
            name, 
            description, 
            price, 
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",  
            category
        });
        res.status(201).json({product, message: "Product created successfully"});

    } catch (error) {
        console.log("Error in createProductController", error.message);
        res.status(500).json({message: error.message});

    }
}

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(!product) {
            return res.status(404).json({message: "Product not found"});
        }

        if(product.image) {
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
                console.log("Image deleted from cloudinary");
            } catch (error) {
                console.log("Error deleting image from cloudinary", error.message); 

            }
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "Product deleted successfully"});
 
    } catch (error) {
        console.log("Error in deleteProductController", error.message);
        res.status(500).json({message: error.message});
    }
}

export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {$sample: {size: 4}},
            {$project: {_id: 1, name: 1, description: 1, image: 1, price: 1}}
        ])
        res.status(200).json(products);
    } catch (error) {
        console.log("Error in getRecommendedProductsController", error.message);
        res.status(500).json({message: error.message});
    }
}

export const getProductsByCategory = async (req, res) => {
    const {category} = req.params;
    try {
        const products = await Product.find({category});
        res.status(200).json({products});
    } catch (error) {
        console.log("Error in getProductsByCategoryController", error.message);
        res.status(500).json({message: error.message});
    }
}

export const toggleFeaturedProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(product){
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();
            await updateFeaturedProductsCache();
            res.status(200).json({updatedProduct, message: "Product updated successfully"});
        } else {
            res.status(404).json({message: "Product not found"});
        }
    } catch (error) {
        console.log("Error in toggleFeaturedProductController", error.message);
        res.status(500).json({message: error.message}); 
    }
}

async function updateFeaturedProductsCache() {
    try {
        const featuredProducts = await Product.find({isFeatured: true}).lean();
        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("Error updating featured products cache", error.message);
    }
}