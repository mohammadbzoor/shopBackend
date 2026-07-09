/* eslint-disable node/no-unsupported-features/es-syntax */
class ApiFeaturss {
    constructor(mongooseQuery, queryString) {
        this.mongooseQuery = mongooseQuery;
        this.queryString = queryString;
    }

    filter(){
         //1) Filtering
    const queryStringObj={ ...this.queryString }
    const excludesFields=["page","sort","limit","fields","keyword"];
    excludesFields.forEach(field=>delete queryStringObj[field])

    const filterObj = {};
    Object.entries(queryStringObj).forEach(([key, value]) => {
        //Apply filtreration using [gte,gt,lte,lt] 
        const match = key.match(/^(.*)\[(gte|gt|lte|lt)\]$/);
        if (match) {
            const [, field, operator] = match;
            const parsedValue = Number(value);
   
            // eslint-disable-next-line node/no-unsupported-features/es-syntax
            filterObj[field] = { ...filterObj[field], [`$${operator}`]: Number.isNaN(parsedValue) ? value : parsedValue };
        } else {
            filterObj[key] = value;
        }
    });

    this.mongooseQuery = this.mongooseQuery.find(filterObj);

    return this;
    }

    sort(){
    if(this.queryString.sort){
        const sortBy =this.queryString.sort.split(',').join(' ')
        this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    }else{
        this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
    }
    // هاي الطريقه بنعمل استرجاع لل اوبجكت نفسه 
      return this;    
      //const apiFeaturs = new ApiFeaturs
      //apiFeaturs.filter().sort()
    }

    limitFields(){
         if(this.queryString.fields){
        //title,ratingsAverage,imageCover,price
        const fields=this.queryString.fields.split(',').join(' ')
        //title ratingsAverage imageCover price
        this.mongooseQuery = this.mongooseQuery.select(fields);
    }else{
    this.mongooseQuery = this.mongooseQuery.select('-__v');
    }
    return this;
    }

    search(modleName){
        if (this.queryString.keyword) {
            // eslint-disable-next-line prefer-const
            let query={};
            if(modleName==="Products"){
                
                query.$or= [
                            { title: { $regex: this.queryString.keyword, $options: 'i' } },
                            { description: { $regex: this.queryString.keyword, $options: 'i' } }
                           ];
            }else{
                query.$or=[{ name: { $regex: this.queryString.keyword, $options: 'i' } }];
            }
             this.mongooseQuery = this.mongooseQuery.find(query)
        }
              return this;
            }

    paginate(countDocuments){
        const page = this.queryString.page *1 ||1;
        const limit =this.queryString.limit *1 ||50;
        const skip = (page - 1) * limit;// (2-1)*5 => 5
        const endIndex=page*limit;
        //pagination result 
        const pagination={}
        pagination.currentPage=page;
        pagination.limit=limit;
        //all doc 50 /limit 10 page=5
        pagination.numberOfPages=Math.ceil(countDocuments/limit);

        // next page
        if(endIndex<countDocuments){
            pagination.next=page+1;
        }
        if(skip>0){
            pagination.prev=page-1;
        }


        this.mongooseQuery=this.mongooseQuery.skip(skip).limit(limit);
        this.paginateResult=pagination;
        return this;
   

    }
    
}

module.exports=ApiFeaturss;