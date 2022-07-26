function errorHandler (err,req,res,next){
    if(err.name === "UnauthorizedError"){
        return res.status(500).json({message:"You Are Not Permitted Access"})
    }
    if(err.name === "ValidationError"){
        return res.status(500).json({message:"Invalid Action send"})
    }
    console.log(err)
    return res.status(500).json(err.name)
}

module.exports=errorHandler