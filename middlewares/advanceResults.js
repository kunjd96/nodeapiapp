const advanceResult = (model, populate) => async(req, res, next) => {
    let query;

    const reqQuery = {...req.query };
    const removeFileds = ['select', 'sort', 'limit', 'page'];
    removeFileds.forEach(params => delete reqQuery[params]);
    console.log(reqQuery)

    let querystr = JSON.stringify(reqQuery);

    querystr = querystr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);


    query = model.find(JSON.parse(querystr));
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    if (populate) {
        query = query.populate(populate);
    }

    const result = await query;

    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.advanceResult = {
        success: true,
        count: result.length,
        pagination,
        data: result
    }
    next();
};
module.exports = advanceResult;