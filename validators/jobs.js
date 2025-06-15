const { object, string, boolean, array } = require("yup");

const postJobSchema = object({
  recruiter_id: string().required("This field is required"),
  job_title: string().required("This field is required"),
  company_name: string().required("This field is required"),
  job_desc: string().required("This field is required"),
  emp_type: string().required("This field is required"),
  work_mode: string().required("This field is required"),
  no_of_opening: string().required("This field is required"),
  location: string().required("This field is required"),
  salary_range: string().required("This field is required"),
  exp_level: string().required("This field is required"),
  education_req: string().required("This field is required"),
  skills_req: array().of(string()),
  application_deadline: string().required("This field is required"),
  visibility_status: string().required("This field is required"),
  tags: array().of(string()),
  is_active: boolean(),
});

module.exports = { postJobSchema };
