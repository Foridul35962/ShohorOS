import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";

const isContractor = AsyncHandler(async (req, res, next) => {
    const user = req.user
    if (!user) {
        throw new ApiErrors(401, "user is not auhenticated")
    }

    if (user.role !== "contractor") {
        throw new ApiErrors(403, "user is not authorized")
    }

    next()
})

export default isContractor