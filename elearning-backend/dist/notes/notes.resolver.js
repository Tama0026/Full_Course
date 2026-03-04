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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const notes_service_1 = require("./notes.service");
const note_entity_1 = require("./entities/note.entity");
const note_input_1 = require("./dto/note.input");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let NotesResolver = class NotesResolver {
    notesService;
    constructor(notesService) {
        this.notesService = notesService;
    }
    async createNote(input, user) {
        return this.notesService.create(input, user.id);
    }
    async getLessonNotes(lessonId, user) {
        return this.notesService.findByLesson(lessonId, user.id);
    }
    async updateNote(id, input, user) {
        return this.notesService.update(id, input, user.id);
    }
    async deleteNote(id, user) {
        return this.notesService.delete(id, user.id);
    }
};
exports.NotesResolver = NotesResolver;
__decorate([
    (0, graphql_1.Mutation)(() => note_entity_1.Note),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [note_input_1.CreateNoteInput, Object]),
    __metadata("design:returntype", Promise)
], NotesResolver.prototype, "createNote", null);
__decorate([
    (0, graphql_1.Query)(() => [note_entity_1.Note], { name: 'lessonNotes' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('lessonId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotesResolver.prototype, "getLessonNotes", null);
__decorate([
    (0, graphql_1.Mutation)(() => note_entity_1.Note),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, note_input_1.UpdateNoteInput, Object]),
    __metadata("design:returntype", Promise)
], NotesResolver.prototype, "updateNote", null);
__decorate([
    (0, graphql_1.Mutation)(() => note_entity_1.Note),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotesResolver.prototype, "deleteNote", null);
exports.NotesResolver = NotesResolver = __decorate([
    (0, graphql_1.Resolver)(() => note_entity_1.Note),
    __metadata("design:paramtypes", [notes_service_1.NotesService])
], NotesResolver);
//# sourceMappingURL=notes.resolver.js.map