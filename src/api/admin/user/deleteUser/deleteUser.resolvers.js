const { deleteItem, query, update } = require('../../../../services');

const resolvers = {
    Mutation: {
        deleteUser: async (parent, args, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            try {
                let list = [];
                for (let item of args.userId) {
                    let { data } = await query({
                        params: {
                            partitionKey: [item, 'eq'],
                        },
                    });
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
                    await update({
                        primaryKey: item,
                        method: 'ADD',
                        updateItem: { registerCount: -1 },
                    });
                }

                for (let user of userList) {
                    await deleteItem(user);
                }

                return { success: true, message: '삭제 성공', code: 204 };
            } catch (error) {
                return { success: false, message: 'Failed delete users', code: 500 };
            }
        },
    },
};

module.exports = resolvers;
