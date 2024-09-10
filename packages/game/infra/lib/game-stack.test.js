"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertions_1 = require("aws-cdk-lib/assertions");
const game_stack_1 = require("./game-stack");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const utils_1 = require("@grid-wolf/shared/utils");
describe('game-stack', () => {
    let props;
    let template;
    beforeEach(() => {
        props = {
            env: {
                account: 'account',
                region: 'us-west-2',
                prefix: 'tst'
            },
            dataTableName: 'table',
            defaultApiKey: 'key'
        };
        const app = new aws_cdk_lib_1.App();
        const stack = new game_stack_1.GameStack(app, 'TestStack', props);
        template = assertions_1.Template.fromStack(stack);
    });
    test('should create a handler lambda', () => {
        template.hasResourceProperties('AWS::Lambda::Function', {
            FunctionName: 'tst-grid-wolf-game-handler',
            Environment: {
                Variables: {
                    [utils_1.EnvironmentVariableName.DATA_TABLE_NAME]: 'tst-table'
                }
            }
        });
    });
    test('should create a REST API for game data', () => {
        template.hasResourceProperties('AWS::ApiGateway::RestApi', {
            Body: {
                paths: {
                    '/game': assertions_1.Match.anyValue(),
                    '/game/{gameId}': assertions_1.Match.anyValue(),
                    '/games': assertions_1.Match.anyValue()
                }
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZS1zdGFjay50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ2FtZS1zdGFjay50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdURBQXlEO0FBQ3pELDZDQUF5RDtBQUN6RCw2Q0FBa0M7QUFDbEMsbURBQWtFO0FBRWxFLFFBQVEsQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQzFCLElBQUksS0FBcUIsQ0FBQztJQUMxQixJQUFJLFFBQWtCLENBQUE7SUFFdEIsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLEtBQUssR0FBRztZQUNOLEdBQUcsRUFBRTtnQkFDSCxPQUFPLEVBQUUsU0FBUztnQkFDbEIsTUFBTSxFQUFFLFdBQVc7Z0JBQ25CLE1BQU0sRUFBRSxLQUFLO2FBQ2Q7WUFDRCxhQUFhLEVBQUUsT0FBTztZQUN0QixhQUFhLEVBQUUsS0FBSztTQUNyQixDQUFBO1FBQ0QsTUFBTSxHQUFHLEdBQUcsSUFBSSxpQkFBRyxFQUFFLENBQUM7UUFDdEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxzQkFBUyxDQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckQsUUFBUSxHQUFHLHFCQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZDLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtRQUMxQyxRQUFRLENBQUMscUJBQXFCLENBQUMsdUJBQXVCLEVBQUU7WUFDdEQsWUFBWSxFQUFFLDRCQUE0QjtZQUMxQyxXQUFXLEVBQUU7Z0JBQ1gsU0FBUyxFQUFFO29CQUNULENBQUMsK0JBQXVCLENBQUMsZUFBZSxDQUFDLEVBQUUsV0FBVztpQkFDdkQ7YUFDRjtTQUNGLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDLHdDQUF3QyxFQUFFLEdBQUcsRUFBRTtRQUNsRCxRQUFRLENBQUMscUJBQXFCLENBQUMsMEJBQTBCLEVBQUU7WUFDekQsSUFBSSxFQUFFO2dCQUNKLEtBQUssRUFBRTtvQkFDTCxPQUFPLEVBQUUsa0JBQUssQ0FBQyxRQUFRLEVBQUU7b0JBQ3pCLGdCQUFnQixFQUFFLGtCQUFLLENBQUMsUUFBUSxFQUFFO29CQUNsQyxRQUFRLEVBQUUsa0JBQUssQ0FBQyxRQUFRLEVBQUU7aUJBQzNCO2FBQ0Y7U0FDRixDQUFDLENBQUE7SUFDSixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWF0Y2gsIFRlbXBsYXRlIH0gZnJvbSBcImF3cy1jZGstbGliL2Fzc2VydGlvbnNcIjtcbmltcG9ydCB7IEdhbWVTdGFjaywgR2FtZVN0YWNrUHJvcHMgfSBmcm9tIFwiLi9nYW1lLXN0YWNrXCI7XG5pbXBvcnQgeyBBcHAgfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IEVudmlyb25tZW50VmFyaWFibGVOYW1lIH0gZnJvbSBcIkBncmlkLXdvbGYvc2hhcmVkL3V0aWxzXCI7XG5cbmRlc2NyaWJlKCdnYW1lLXN0YWNrJywgKCkgPT4ge1xuICBsZXQgcHJvcHM6IEdhbWVTdGFja1Byb3BzO1xuICBsZXQgdGVtcGxhdGU6IFRlbXBsYXRlXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgcHJvcHMgPSB7XG4gICAgICBlbnY6IHtcbiAgICAgICAgYWNjb3VudDogJ2FjY291bnQnLFxuICAgICAgICByZWdpb246ICd1cy13ZXN0LTInLFxuICAgICAgICBwcmVmaXg6ICd0c3QnXG4gICAgICB9LFxuICAgICAgZGF0YVRhYmxlTmFtZTogJ3RhYmxlJyxcbiAgICAgIGRlZmF1bHRBcGlLZXk6ICdrZXknXG4gICAgfVxuICAgIGNvbnN0IGFwcCA9IG5ldyBBcHAoKTtcbiAgICBjb25zdCBzdGFjayA9IG5ldyBHYW1lU3RhY2soYXBwLCAnVGVzdFN0YWNrJywgcHJvcHMpO1xuICAgIHRlbXBsYXRlID0gVGVtcGxhdGUuZnJvbVN0YWNrKHN0YWNrKTtcbiAgfSk7XG5cbiAgdGVzdCgnc2hvdWxkIGNyZWF0ZSBhIGhhbmRsZXIgbGFtYmRhJywgKCkgPT4ge1xuICAgIHRlbXBsYXRlLmhhc1Jlc291cmNlUHJvcGVydGllcygnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJywge1xuICAgICAgRnVuY3Rpb25OYW1lOiAndHN0LWdyaWQtd29sZi1nYW1lLWhhbmRsZXInLFxuICAgICAgRW52aXJvbm1lbnQ6IHtcbiAgICAgICAgVmFyaWFibGVzOiB7XG4gICAgICAgICAgW0Vudmlyb25tZW50VmFyaWFibGVOYW1lLkRBVEFfVEFCTEVfTkFNRV06ICd0c3QtdGFibGUnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgdGVzdCgnc2hvdWxkIGNyZWF0ZSBhIFJFU1QgQVBJIGZvciBnYW1lIGRhdGEnLCAoKSA9PiB7XG4gICAgdGVtcGxhdGUuaGFzUmVzb3VyY2VQcm9wZXJ0aWVzKCdBV1M6OkFwaUdhdGV3YXk6OlJlc3RBcGknLCB7XG4gICAgICBCb2R5OiB7XG4gICAgICAgIHBhdGhzOiB7XG4gICAgICAgICAgJy9nYW1lJzogTWF0Y2guYW55VmFsdWUoKSxcbiAgICAgICAgICAnL2dhbWUve2dhbWVJZH0nOiBNYXRjaC5hbnlWYWx1ZSgpLFxuICAgICAgICAgICcvZ2FtZXMnOiBNYXRjaC5hbnlWYWx1ZSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9KTtcbn0pO1xuIl19