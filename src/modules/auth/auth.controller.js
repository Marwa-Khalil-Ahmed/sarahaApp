import { Router } from 'express'
import * as registrationService from './service/registration.service.js';
import * as loginService from './service/login.service.js';
import * as authService from './service/auth.service.js';
import { validation } from '../../middleware/validation.middleware.js';
import * as validators from './auth.validation.js';

const router = Router();



router.post("/signup", validation(validators.signup), registrationService.signup);
router.patch("/confirm-email", registrationService.confirmEmail);
router.post("/login", validation(validators.login), loginService.login);

router.post('/forgot-password', validation(validators.sendOtpEmail), authService.passwordOTP);
router.post('/reactivate-account', validation(validators.sendOtpEmail), authService.reactivationOTP);
router.post('/confirm-email-by-OTP', validation(validators.sendOtpEmail), authService.confirmEmailByOTP);

export default router
