import ApiError from "../config/utils/api-error.js"


const validate = (dtoClass) => {
    return (req, res, next) => {
        const {errors, value} = dtoClass.validate(req.body)
        // console.log("Value = ", value)
        if(errors) {
            throw new ApiError.badRequest(errors.join("; "))
        }

        req.body = value;

        next();
    }
}

export default validate;