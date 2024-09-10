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
            handlerTemplateKey: 'handler',
            defaultApiKey: props.defaultApiKey
        });
    }
}
exports.GameStack = GameStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImdhbWUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkRBQTZEO0FBRTdELCtCQUErQjtBQUMvQiw2REFBZ0U7QUFHaEUsTUFBTSxTQUFTLEdBQUcsSUFBQSxjQUFPLEVBQUMsU0FBUyxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDekQsTUFBTSxZQUFZLEdBQUcsSUFBQSxjQUFPLEVBQUMsU0FBUyxFQUFFLHdCQUF3QixDQUFDLENBQUM7QUFPbEUsTUFBYSxTQUFVLFNBQVEsMEJBQWE7SUFDMUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFxQjtRQUM3RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixJQUFJLDZCQUFnQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pELEdBQUcsS0FBSztZQUNSLGFBQWEsRUFBRSxNQUFNO1lBQ3JCLFdBQVcsRUFBRSxTQUFTO1lBQ3RCLFdBQVcsRUFBRSxZQUFZO1lBQ3pCLGtCQUFrQixFQUFFLFNBQVM7WUFDN0IsYUFBYSxFQUFFLEtBQUssQ0FBQyxhQUFhO1NBQ25DLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRjtBQWJELDhCQWFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgR3JpZFdvbGZTdGFjayB9IGZyb20gXCJAZ3JpZC13b2xmL3NoYXJlZC9jb25zdHJ1Y3RzXCI7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBTaW5nbGVIYW5kbGVyQXBpIH0gZnJvbSAnQGdyaWQtd29sZi9zaGFyZWQvY29uc3RydWN0cyc7XG5pbXBvcnQgeyBHcmlkV29sZlByb3BzIH0gZnJvbSBcIkBncmlkLXdvbGYvc2hhcmVkL2RvbWFpblwiO1xuXG5jb25zdCBTUEVDX1BBVEggPSByZXNvbHZlKF9fZGlybmFtZSwgJy4uL2FwaS1zcGVjLnlhbWwnKTtcbmNvbnN0IEhBTkRMRVJfUEFUSCA9IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vbGliL2dhbWUtaGFuZGxlcicpO1xuXG5leHBvcnQgaW50ZXJmYWNlIEdhbWVTdGFja1Byb3BzIGV4dGVuZHMgR3JpZFdvbGZQcm9wcyB7XG4gIGRhdGFUYWJsZU5hbWU6IHN0cmluZztcbiAgZGVmYXVsdEFwaUtleTogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgR2FtZVN0YWNrIGV4dGVuZHMgR3JpZFdvbGZTdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBHYW1lU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgbmV3IFNpbmdsZUhhbmRsZXJBcGkodGhpcywgdGhpcy5nZW5lcmF0ZUlkKCdhcGknKSwge1xuICAgICAgLi4ucHJvcHMsXG4gICAgICBjb25zdHJ1Y3ROYW1lOiAnZ2FtZScsXG4gICAgICBhcGlTcGVjUGF0aDogU1BFQ19QQVRILFxuICAgICAgaGFuZGxlclBhdGg6IEhBTkRMRVJfUEFUSCxcbiAgICAgIGhhbmRsZXJUZW1wbGF0ZUtleTogJ2hhbmRsZXInLFxuICAgICAgZGVmYXVsdEFwaUtleTogcHJvcHMuZGVmYXVsdEFwaUtleVxuICAgIH0pXG4gIH1cbn1cbiJdfQ==