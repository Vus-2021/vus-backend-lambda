const dayjs = require('dayjs');

const { get, query } = require('../../../../services');

const resolvers = {
    Query: {
        getBusApplicant: async (parent, args, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            const { isMatched, gsiSortKey, name, month, state, userId, type, isCancellation } = {
                isMatched: args.isMatched ? 'eq' : 'contains',
                gsiSortKey: args.route || '강남',
                name: args.name,
                month: args.month || dayjs(new Date()).format('YYYY-MM'),
                state: args.state,
                userId: args.userId,
                type: args.type,
                isCancellation: args.isCancellation,
            };

            let params = {
                sortKey: [`#applyRoute#${month}`, 'eq'],
                gsiSortKey: [gsiSortKey, 'eq'],
                index: ['sk-index', 'using'],
            };

            let filterExpression = {
                partitionKey: [userId, isMatched],
                state: [state, isMatched],
                isCancellation: [isCancellation, 'eq'],
            };

            try {
                const { success, message, code, data: monthResult } = await query({
                    params,
                    filterExpression,
                });

                const userIdList = monthResult.map((applicant) => applicant.partitionKey);
                const userMap = new Map();

                monthResult.forEach((info) => {
                    userMap.set(info.partitionKey, {
                        route: info.gsiSortKey,
                        previousMonthState: info.previousMonthState,
                        state: info.state,
                        isCancellation: info.isCancellation,
                    });
                });

                let users = [];
                for (let userId of userIdList) {
                    let { data: user } = await get({
                        partitionKey: userId,
                        sortKey: '#user',
                    });
                    users.push(user);
                }

                users.forEach((user) => {
                    userMap.set(
                        user.partitionKey,
                        Object.assign(
                            { ...userMap.get(user.partitionKey) },
                            {
                                name: user.name,
                                registerDate: user.gsiSortKey.split('#')[2],
                                type: user.type,
                                userId: user.partitionKey,
                                phoneNumber: user.phoneNumber,
                            }
                        )
                    );
                });

                let data = [...userMap.values()];
                /**
                 * TODO 리팩토링
                 */
                if (name) data = data.filter((user) => user.name.match(new RegExp(name)));
                if (type) data = data.filter((user) => user.type === type);
                return { success, message, code, data };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
