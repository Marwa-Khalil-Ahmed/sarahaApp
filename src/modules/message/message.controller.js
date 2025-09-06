import { Router } from "express"
const router = new Router();

import * as messageServices from "./service/message.service.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./message.validation.js"
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import { endpoint } from "../user/user.endpoint.js";

router.post('/', validation(validators.sendMessage), messageServices.sendMessage)
router.delete('/:messageId', authentication(), authorization(endpoint.deleteMessage), messageServices.deleteMessage);


export default router;