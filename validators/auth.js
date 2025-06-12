const { object, string } = require("yup");

const loginSchema = object({
  email: string().required("Email is required").email("Invalid email id"),
  password: string().required("Password is required"),
});

module.exports = { loginSchema };
