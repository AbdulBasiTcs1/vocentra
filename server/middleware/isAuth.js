import jwt from "jsonwebtoken";

export const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token
        if(!token){
            return res.status(401).json({message: "Unauthorized (User doesn't have token)."})
        }

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET)
        console.log(verifyToken)

        if(!verifyToken){
            return res.status(401).json({message: "Unauthorized (Token is not valid)."})
        }
        req.user = verifyToken
        console.log("success")
        next()
    } catch (error) {
        console.error("Error in isAuth middleware:", error);
        res.status(401).json({ message: "Unauthorized" });
    }
}

