#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = __importStar(require("aws-cdk-lib"));
const game_stack_1 = require("../lib/game-stack");
const utils_1 = require("@grid-wolf/shared/utils");
const envMap = (0, utils_1.loadEnv)([
    utils_1.EnvironmentVariableName.DATA_TABLE_NAME,
    utils_1.EnvironmentVariableName.DEFAULT_API_KEY
]);
const app = new cdk.App();
const props = {
    env: {
        account: envMap[utils_1.EnvironmentVariableName.ACCOUNT],
        region: envMap[utils_1.EnvironmentVariableName.REGION],
        prefix: envMap[utils_1.EnvironmentVariableName.PREFIX]
    },
    dataTableName: process.env[utils_1.EnvironmentVariableName.DATA_TABLE_NAME],
    defaultApiKey: process.env[utils_1.EnvironmentVariableName.DEFAULT_API_KEY]
};
new game_stack_1.GameStack(app, `${props.env.prefix}CentralInfraStack`, props);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImdhbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSx1Q0FBcUM7QUFDckMsaURBQW1DO0FBQ25DLGtEQUE4RDtBQUM5RCxtREFBMEU7QUFHMUUsTUFBTSxNQUFNLEdBQUcsSUFBQSxlQUFPLEVBQUM7SUFDckIsK0JBQXVCLENBQUMsZUFBZTtJQUN2QywrQkFBdUIsQ0FBQyxlQUFlO0NBQ3hDLENBQUMsQ0FBQztBQUNILE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRTFCLE1BQU0sS0FBSyxHQUFtQjtJQUM1QixHQUFHLEVBQUU7UUFDSCxPQUFPLEVBQUUsTUFBTSxDQUFDLCtCQUF1QixDQUFDLE9BQU8sQ0FBQztRQUNoRCxNQUFNLEVBQUUsTUFBTSxDQUFDLCtCQUF1QixDQUFDLE1BQU0sQ0FBQztRQUM5QyxNQUFNLEVBQUUsTUFBTSxDQUFDLCtCQUF1QixDQUFDLE1BQU0sQ0FBQztLQUMvQztJQUNELGFBQWEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUF1QixDQUFDLGVBQWUsQ0FBRTtJQUNwRSxhQUFhLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBdUIsQ0FBQyxlQUFlLENBQUU7Q0FDckUsQ0FBQztBQUNGLElBQUksc0JBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sbUJBQW1CLEVBQUUsS0FBSyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3Rlcic7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgR2FtZVN0YWNrLCBHYW1lU3RhY2tQcm9wcyB9IGZyb20gJy4uL2xpYi9nYW1lLXN0YWNrJztcbmltcG9ydCB7IGxvYWRFbnYsIEVudmlyb25tZW50VmFyaWFibGVOYW1lIH0gZnJvbSAnQGdyaWQtd29sZi9zaGFyZWQvdXRpbHMnXG5pbXBvcnQgeyBHcmlkV29sZlByb3BzIH0gZnJvbSAnQGdyaWQtd29sZi9zaGFyZWQvZG9tYWluJztcblxuY29uc3QgZW52TWFwID0gbG9hZEVudihbXG4gIEVudmlyb25tZW50VmFyaWFibGVOYW1lLkRBVEFfVEFCTEVfTkFNRSxcbiAgRW52aXJvbm1lbnRWYXJpYWJsZU5hbWUuREVGQVVMVF9BUElfS0VZXG5dKTtcbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XG5cbmNvbnN0IHByb3BzOiBHYW1lU3RhY2tQcm9wcyA9IHtcbiAgZW52OiB7XG4gICAgYWNjb3VudDogZW52TWFwW0Vudmlyb25tZW50VmFyaWFibGVOYW1lLkFDQ09VTlRdLFxuICAgIHJlZ2lvbjogZW52TWFwW0Vudmlyb25tZW50VmFyaWFibGVOYW1lLlJFR0lPTl0sXG4gICAgcHJlZml4OiBlbnZNYXBbRW52aXJvbm1lbnRWYXJpYWJsZU5hbWUuUFJFRklYXVxuICB9LFxuICBkYXRhVGFibGVOYW1lOiBwcm9jZXNzLmVudltFbnZpcm9ubWVudFZhcmlhYmxlTmFtZS5EQVRBX1RBQkxFX05BTUVdISxcbiAgZGVmYXVsdEFwaUtleTogcHJvY2Vzcy5lbnZbRW52aXJvbm1lbnRWYXJpYWJsZU5hbWUuREVGQVVMVF9BUElfS0VZXSFcbn07XG5uZXcgR2FtZVN0YWNrKGFwcCwgYCR7cHJvcHMuZW52LnByZWZpeH1DZW50cmFsSW5mcmFTdGFja2AsIHByb3BzKTtcbiJdfQ==