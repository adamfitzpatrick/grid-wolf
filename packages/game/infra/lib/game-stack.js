"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameStack = void 0;
const constructs_1 = require("@grid-wolf/shared/constructs");
const path_1 = require("path");
const constructs_2 = require("@grid-wolf/shared/constructs");
const SPEC_PATH = (0, path_1.resolve)(__dirname, '../api-spec.yaml');
const HANDLER_PATH = (0, path_1.resolve)(__dirname, '../../lib/game-handler');
class GameStack extends constructs_1.GridWolfStack {
    constructor(scope, id, props) {
        super(scope, id, props);
        new constructs_2.SingleHandlerApi(this, this.generateId('api'), {
            ...props,
            constructName: 'game',
            apiSpecPath: SPEC_PATH,
            handlerPath: HANDLER_PATH,
            authArnTemplateKey: 'authArn',
            handlerTemplateKey: 'handler',
            defaultApiKey: props.defaultApiKey
        });
    }
}
exports.GameStack = GameStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImdhbWUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkRBQTZEO0FBRTdELCtCQUErQjtBQUMvQiw2REFBZ0U7QUFHaEUsTUFBTSxTQUFTLEdBQUcsSUFBQSxjQUFPLEVBQUMsU0FBUyxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDekQsTUFBTSxZQUFZLEdBQUcsSUFBQSxjQUFPLEVBQUMsU0FBUyxFQUFFLHdCQUF3QixDQUFDLENBQUM7QUFPbEUsTUFBYSxTQUFVLFNBQVEsMEJBQWE7SUFDMUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFxQjtRQUM3RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixJQUFJLDZCQUFnQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pELEdBQUcsS0FBSztZQUNSLGFBQWEsRUFBRSxNQUFNO1lBQ3JCLFdBQVcsRUFBRSxTQUFTO1lBQ3RCLFdBQVcsRUFBRSxZQUFZO1lBQ3pCLGtCQUFrQixFQUFFLFNBQVM7WUFDN0Isa0JBQWtCLEVBQUUsU0FBUztZQUM3QixhQUFhLEVBQUUsS0FBSyxDQUFDLGFBQWE7U0FDbkMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGO0FBZEQsOEJBY0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBHcmlkV29sZlN0YWNrIH0gZnJvbSBcIkBncmlkLXdvbGYvc2hhcmVkL2NvbnN0cnVjdHNcIjtcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IFNpbmdsZUhhbmRsZXJBcGkgfSBmcm9tICdAZ3JpZC13b2xmL3NoYXJlZC9jb25zdHJ1Y3RzJztcbmltcG9ydCB7IEdyaWRXb2xmUHJvcHMgfSBmcm9tIFwiQGdyaWQtd29sZi9zaGFyZWQvZG9tYWluXCI7XG5cbmNvbnN0IFNQRUNfUEFUSCA9IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vYXBpLXNwZWMueWFtbCcpO1xuY29uc3QgSEFORExFUl9QQVRIID0gcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9saWIvZ2FtZS1oYW5kbGVyJyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2FtZVN0YWNrUHJvcHMgZXh0ZW5kcyBHcmlkV29sZlByb3BzIHtcbiAgZGF0YVRhYmxlTmFtZTogc3RyaW5nO1xuICBkZWZhdWx0QXBpS2V5OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBHYW1lU3RhY2sgZXh0ZW5kcyBHcmlkV29sZlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEdhbWVTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBuZXcgU2luZ2xlSGFuZGxlckFwaSh0aGlzLCB0aGlzLmdlbmVyYXRlSWQoJ2FwaScpLCB7XG4gICAgICAuLi5wcm9wcyxcbiAgICAgIGNvbnN0cnVjdE5hbWU6ICdnYW1lJyxcbiAgICAgIGFwaVNwZWNQYXRoOiBTUEVDX1BBVEgsXG4gICAgICBoYW5kbGVyUGF0aDogSEFORExFUl9QQVRILFxuICAgICAgYXV0aEFyblRlbXBsYXRlS2V5OiAnYXV0aEFybicsXG4gICAgICBoYW5kbGVyVGVtcGxhdGVLZXk6ICdoYW5kbGVyJyxcbiAgICAgIGRlZmF1bHRBcGlLZXk6IHByb3BzLmRlZmF1bHRBcGlLZXlcbiAgICB9KVxuICB9XG59XG4iXX0=