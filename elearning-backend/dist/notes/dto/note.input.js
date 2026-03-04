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
exports.UpdateNoteInput = exports.CreateNoteInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let CreateNoteInput = class CreateNoteInput {
    content;
    lessonId;
    videoTimestamp;
};
exports.CreateNoteInput = CreateNoteInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Content is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000, { message: 'Note must be under 5000 characters' }),
    __metadata("design:type", String)
], CreateNoteInput.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Lesson ID is required' }),
    __metadata("design:type", String)
], CreateNoteInput.prototype, "lessonId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true, defaultValue: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateNoteInput.prototype, "videoTimestamp", void 0);
exports.CreateNoteInput = CreateNoteInput = __decorate([
    (0, graphql_1.InputType)()
], CreateNoteInput);
let UpdateNoteInput = class UpdateNoteInput {
    content;
};
exports.UpdateNoteInput = UpdateNoteInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], UpdateNoteInput.prototype, "content", void 0);
exports.UpdateNoteInput = UpdateNoteInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateNoteInput);
//# sourceMappingURL=note.input.js.map