"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankQuestion = exports.QuestionBank = void 0;
const graphql_1 = require("@nestjs/graphql");
let QuestionBank = class QuestionBank {
    id;
    name;
    description;
    category;
    userId;
    createdAt;
    updatedAt;
    questions;
};
exports.QuestionBank = QuestionBank;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], QuestionBank.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], QuestionBank.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], QuestionBank.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], QuestionBank.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], QuestionBank.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], QuestionBank.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], QuestionBank.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [BankQuestion], { nullable: 'itemsAndList' }),
    __metadata("design:type", Array)
], QuestionBank.prototype, "questions", void 0);
exports.QuestionBank = QuestionBank = __decorate([
    (0, graphql_1.ObjectType)()
], QuestionBank);
let BankQuestion = class BankQuestion {
    id;
    bankId;
    content;
    options;
    correctAnswer;
    explanation;
    difficulty;
    createdAt;
};
exports.BankQuestion = BankQuestion;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], BankQuestion.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BankQuestion.prototype, "bankId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BankQuestion.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", String)
], BankQuestion.prototype, "options", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BankQuestion.prototype, "correctAnswer", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BankQuestion.prototype, "explanation", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BankQuestion.prototype, "difficulty", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], BankQuestion.prototype, "createdAt", void 0);
exports.BankQuestion = BankQuestion = __decorate([
    (0, graphql_1.ObjectType)()
], BankQuestion);
//# sourceMappingURL=question-bank.entity.js.map