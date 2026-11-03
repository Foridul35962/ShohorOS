import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";

const isStaff = AsyncHandler(async (req, res, next) => {
    const user = req.user
    if (!user) {
        throw new ApiErrors(401, "user is not auhenticated")
    }

    if (user.role !== "project-staff") {
        throw new ApiErrors(403, "user is not authorized")
    }

    next()
})

export default isStaff