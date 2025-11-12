import jsonwebtoken from "jsonwebtoken";
const jwt = jsonwebtoken
import dotenv from "dotenv";
dotenv.config();



function authMiddleware(req,res,next){
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({message: "Unauthorized"})
    }

    const token = authHeader.split(' ')[1];
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded.userID){
            return res.status(401).json({message: "Unauthorized"})
        }
        req.userID = decoded.userID;
        next();
    }
    catch(err){
        return res.status(401).json({message: "Unauthorized"})
    }
}

export {authMiddleware};