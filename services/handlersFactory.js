const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const ApiFeaturss = require('../utils/apiFeaturss');

exports.deleteOne = (Model) => asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const documents = await Model.findById(id);

    if (!documents) {
        return next(new ApiError(`No documents for this id ${id}`, 404));
    }
    // Trigger deleteOne() enevt when update document 

    await documents.deleteOne();
    res.status(200).json({ data: documents });
});

exports.updateOne=(Modle)=>
    asyncHandler(async (req, res,next) => {
        const documents = await Modle.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true})
    
        if (!documents) {
            return next(new ApiError(`No documents for this id ${req.params.id}`, 404));
        }

        // Trigger "save" enevt when update document 
        documents.save();
        res.status(200).json({data: documents});
    });


exports.createOne=(Modle)=>asyncHandler(async (req, res) => {
    // asyncHandler will catch the error and pass it to the error handling middleware
    const newdocuments = await Modle.create(req.body);
    res.status(201).json({ data: newdocuments });

});

exports.getOne=(Modle,populateOptions)=> asyncHandler(async (req,res,next)=>{
    
    const query= Modle.findById(req.params.id);
    //1) Build Query
    if(populateOptions){
        query.populate(populateOptions);
    }
    //2 ) Execute Query
    const documents = await query;

    if (!documents) {
        return next(new ApiError(`No documents for this id ${req.params.id}`, 404));
    }
    
    res.status(200).json({data: documents});
});

exports.getAll=(Modle,Modlename='')=>asyncHandler(async (req, res) => {
    let filter={};
    if(req.filterObj){
        filter=req.filterObj
    }
    const docuemntsCounts=await Modle.countDocuments();
    // Build Query
    const apiFeatures=new ApiFeaturss(Modle.find(filter),req.query)
    .paginate(docuemntsCounts)
    .filter()
    .limitFields()
    .search(Modlename)
    .sort();

       // Execute Query
   const {mongooseQuery,paginateResult}=apiFeatures;
    const documents = await mongooseQuery ;
    res.status(200).json({result: documents.length,paginateResult, data: documents });
});