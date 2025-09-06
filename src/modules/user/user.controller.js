import { Router } from "express";
import { freezePofile, reactivateProfile, resetPassword, shareProfile, updatePassword, updateProfile, userProfile } from "./services/user.service.js";
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import { endpoint } from "./user.endpoint.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./user.validation.js"

const router = new Router();

router.get('/profile', authentication(), authorization(endpoint.profile), userProfile);
router.patch('/profile', validation(validators.updateProfile), authentication(), authorization(endpoint.profile), updateProfile);
router.get('/:userId/profile', validation(validators.shareProfile), shareProfile);

router.patch('/profile/updatePassword', validation(validators.updatePassword), authentication(), authorization(endpoint.profile), updatePassword)
router.patch('/profile/resetPassword', validation(validators.resetPassword), resetPassword)

router.delete('/profile', authentication(), authorization(endpoint.profile), freezePofile)
router.patch('/profile/reactivate', validation(validators.reactivateProfile), reactivateProfile)


export default router;