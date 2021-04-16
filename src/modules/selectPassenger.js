const dayjs = require('dayjs');

class SelectPassenger {
    constructor(limitCount, applicants, monthArg, sortType) {
        this.fulfilled = [];
        this.reject = [];
        this.limitCount = limitCount;
        this.applicants = applicants;
        this.month = monthArg;
        this.sortType = sortType;
    }
    allPass() {
        if (this.applicants.length === 0) {
            return this;
        }

        if (this.applicants.length < this.limitCount) {
            this.fulfilled = this.applicants;
            this.applicants = [];
        }
        return this;
    }
    sortPeople() {
        this.applicants.sort((a, b) => {
            if (this.sortType === 'random') return Math.random() - Math.random();
            else return dayjs(b[this.sortType]) - dayjs(a[this.sortType]);
        });
        return this;
    }

    selectByRegisterDate() {
        const dueDate = dayjs().subtract(this.month, 'month');
        const group = [];

        if (this.limitCount === 0 || this.applicants.length === 0) {
            return this;
        }
        this.applicants = this.applicants.filter((user) => {
            if (dayjs.duration(dueDate.diff(user.registerDate))['$ms'] <= 0) {
                group.push(user);
            }
            return dayjs.duration(dueDate.diff(user.registerDate))['$ms'] > 0;
        });

        if (this.applicants.length === 0) {
            this.fulfilled = group;
            this.limitCount = this.limitCount - group.length;
            return this;
        }

        this.pick(group);
        return this;
    }
    selectByPreNotPassengers() {
        const group = [];

        if (this.limitCount === 0 || this.applicants.length === 0) {
            return this;
        }
        this.applicants = this.applicants.filter((applicant) => {
            if (applicant.previousMonthState === ('notApply' || 'reject')) {
                group.push(applicant);
            }
            return applicant.previousMonthState !== ('notApply' || 'reject');
        });
        this.pick(group);
        return this;
    }
    selectByQueue() {
        const group = this.applicants;
        this.applicants = [];
        this.pick(group);
        return this;
    }
    pick(group) {
        if (group.length <= this.limitCount) {
            this.fulfilled = [...this.fulfilled, ...group];
            this.limitCount -= group.length;
        } else if (group.length > this.limitCount) {
            this.fulfilled = [...this.fulfilled, ...group.slice(0, this.limitCount)];
            this.reject = [...group.slice(this.limitCount, group.length), ...this.applicants];
            this.applicants = [];
            this.limitCount = 0;
        }
        return this;
    }
    getResult() {
        return this;
    }
}

const selectPassenger = ({ applicants, limitCount, methodList, sortType, monthArg }) => {
    let passengers = new SelectPassenger(limitCount, applicants, monthArg, sortType);

    methodList.forEach((method) => {
        passengers = passengers[method]();
    });
    return passengers;
};

module.exports = selectPassenger;
