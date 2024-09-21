// makes a constant method to handle async functions properly while maintainigng the code

const asyncHandler = (requestHandler)=>{
    return (req,res,next)=>{
        Promise
        .resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))
    }

}

export {asyncHandler}

// TRY CATCH WAY
// // passing our requested function into an async fn
// const asyncHandler=(fn)=> {async (req,res,next)=> {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         //usuall way to sending errors, the json part is for frotnend engg to understand the status
//         res.status(error.code || 500).json({
//             success: false,
//             message : error.message
//         })
        
//     }
// }}