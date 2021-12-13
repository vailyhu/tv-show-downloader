export const getAllItem = async(Model, filters = {}, sortBy = {name: 1}) => Model.find(filters).sort(sortBy);

export const getItem = async(Model, filter = {}) => {
    const item = await Model.findOne(filter);
    return item || null;
};

export const createItem = async(Model, data) => {
    try {
        const item = await Model.insert(data);
        return item?._id ? item : null;
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const updateItem = async(Model, filter, data, opts = {}) => {
    try {
        const updateData = opts.override === true ? data : {$set: data};
        delete opts.override;
        const count = await Model.update(filter, updateData, {opts});

        return count > 0;
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const deleteItem = async(Model, filter) => {
    try {
        const count = await Model.remove(filter, {});
        return count > 0;
    } catch (e) {
        console.error(e);
        return null;
    }
};
