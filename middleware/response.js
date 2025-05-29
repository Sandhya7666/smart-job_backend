// const successResponse=(res,data={},message="Success",statusCode=200)=>{
//     return res.status(statusCode).json({
//         status:true,
//         statusCode,
//         message,
//         errors: null,
//         data,
//     })
// }

const successResponse=(res,data={},message="Success",statusCode=200)=>{
    return res.status(statusCode).json({
        status:true,
        statusCode,
        message,
        data,
    })
}


// function errorResponse(res, message = "Something went wrong", errors = {}, statusCode = 500, error_type = "server.error") {
//   return res.status(statusCode).json({
//     status: false,
//     statusCode,
//     error_type,
//     message,
//     errors,
//   });
// }


function errorResponse(res, message = "Something went wrong", statusCode = 500, error_type = "server.error") {
  return res.status(statusCode).json({
    status: false,
    statusCode,
    error_type,
    message,
  });
}

module.exports = {
  successResponse,
  errorResponse,
};