"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    prisma;
    modelName;
    constructor(prisma, modelName) {
        this.prisma = prisma;
        this.modelName = modelName;
    }
    get model() {
        return this.prisma[this.modelName];
    }
    async findAll(args) {
        return this.model.findMany(args);
    }
    async findById(id, include) {
        return this.model.findUnique({
            where: { id },
            include,
        });
    }
    async findOne(args) {
        return this.model.findFirst(args);
    }
    async create(data) {
        return this.model.create({ data });
    }
    async update(id, data) {
        return this.model.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return this.model.delete({
            where: { id },
        });
    }
    async count(where) {
        return this.model.count({ where });
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=base.repository.js.map