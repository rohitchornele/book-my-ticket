import Joi from "joi";
import BaseDto from "../../common/dto/base.dto.js";

class RegisterDto extends BaseDto {
    static schema = Joi.object({
        
        firstName : Joi.string().trim().min(2).max(64).required(),
        lastName : Joi.string().trim().max(64),
        email : Joi.string().email().lowercase().required(),
        password : Joi.string().min(8).required(),
        role : Joi.string().valid("customer", "cinema", "admin").default("customer"),
    })

}

export default RegisterDto;