import express from 'express';
import { addToCart, getCartProducts, removeAllFromCart, updateQuanity } from '../controllers/cart.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';    

const router = express.Router();    

router.get("/", protectRoute, getCartProducts)
router.post("/", protectRoute, addToCart)
router.delete("/", protectRoute, removeAllFromCart)    
router.put("/:id", protectRoute, updateQuanity)

export default router   
