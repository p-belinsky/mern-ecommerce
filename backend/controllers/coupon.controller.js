import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({userId: req.user._id, isActive: true});
        res.status(200).json(coupon || null);
    } catch (error) {
        console.log("Error in getCouponController", error.message);
        res.status(500).json({message: error.message});
    }
}   

export const validateCoupon = async (req, res) => {
    try {
        const {code} = req.body;
        const coupon = await Coupon.findOne({code:code, userId: req.user._id, isActive: true});
        
        if(!coupon) {
            res.status(404).json({message: "Coupon not found"});
        }

        if(coupon.expirationDate < new Date()) {
            coupon.isActive = false;
            await coupon.save();
            res.status(404).json({message: "Coupon has expired"});
        }

        res.status(200).json({
            message: "Coupon is valid",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage
        });

    } catch (error) {
        console.log("Error in validateCouponController", error.message);
        res.status(500).json({message: error.message}); 
    }
}