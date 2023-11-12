const operatorModel = {
    schema: process.env.AUTH_SCHEMA,
    table: 'operators',
    columns: {
        _id: { type: 'serial', primaryKey: true, notNull: true },
        email: { type: 'text', primaryKey: false, notNull: true },
        password: { type: 'text', primaryKey: false, notNull: false },
        operator: { type: 'text', primaryKey: false, notNull: true},
    },
};

module.exports = operatorModel;