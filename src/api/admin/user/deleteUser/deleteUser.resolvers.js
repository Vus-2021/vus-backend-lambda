const { query, transaction } = require('../../../../services');

const resolvers = {
    Mutation: {
        deleteUser: async (parent, args, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            let Update = [];
            let Delete = [];
            try {
                let list = [];
                for (let item of args.userId) {
                    let { data } = await query({
                        params: {
                            partitionKey: [item, 'eq'],
                        },
                        tableName: process.env.TABLE_NAME,
                    });
                    Delete.push(
                        ...data
                            .filter((item) => item.detailPartitionKey)
                            .map((detail) => {
                                return {
                                    primaryKey: {
                                        partitionKey: detail.detailPartitionKey,
                                        sortKey: `#${detail.sortKey.split('#')[2]}#${
                                            detail.partitionKey
                                        }`,
                                    },
                                };
                            })
                    );
                    list.push(
                        ...data.map((dataItem) => {
                            return {
                                partitionKey: dataItem.partitionKey,
                                sortKey: dataItem.sortKey,
                                routes: dataItem.gsiSortKey,
                                busId: dataItem.busId,
                                month: dataItem.sortKey.split('#')[2],
                            };
                        })
                    );
                }
                const userList = list.map((item) => {
                    return {
                        partitionKey: item.partitionKey,
                        sortKey: item.sortKey,
                    };
                });
                const route = list
                    .filter((item) => item.sortKey !== '#user')
                    .map((item) => {
                        return {
                            partitionKey: item.busId,
                            sortKey: `#${item.month}`,
                        };
                    });

                for (let item of route) {
                    Update.push({
                        primaryKey: item,
                        method: 'ADD',
                        updateItem: { registerCount: -1 },
                    });
                }

                for (let user of userList) {
                    Delete.push({ primaryKey: user });
                }
                const { success, message, code } = await transaction({
                    Update,
                    Delete,
                    tableName: process.env.TABLE_NAME,
                });
                return { success, message, code };
            } catch (error) {
                return { success: false, message: 'Failed delete users', code: 500 };
            }
        },
    },
};

module.exports = resolvers;
