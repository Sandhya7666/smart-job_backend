const { errorResponse } = require("../middleware/response");

const validate = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    next();
  } catch (err) {
    return res.status(400).json({
      status: true,
      statusCode: 400,
      message: "Validation error is occured",
      errors: err.inner.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }
};

module.exports = validate;
