import { Router } from "express";
import { logOutUser, loginUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router()
/*//upload.fields
Array of Field objects describing multipart form fields to process.
Returns middleware that processes multiple files associated with the given form fields.

The Request object will be populated with a files object which maps each field name to an array of the associated file information objects.

*/
router.route("/register").post(
    upload.fields([{
        name:"avatar",
        maxCount:1
    },{
        name:"coverImage",
        maxCount:1
    }]),
    
    registerUser)


router.route("/login").post(loginUser)


//secured routes

router.route("/logout").post(verifyJWT,logOutUser)
router.route("/refresh-token").post(refreshAccessToken)
export default router