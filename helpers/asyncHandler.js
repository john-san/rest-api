/* Handler function to wrap each route */
const asyncHandler = (cb) => {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (err) {
      // Handle general error.  SequelizeValidation errors also passed through here
      next(err) 
    }
  }
}

module.exports = asyncHandler;