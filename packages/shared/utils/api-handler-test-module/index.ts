export class DynamodbSpies {
  private _send: jest.Mock;
  private _putCommand: jest.Mock;
  private _getCommand: jest.Mock;
  private _queryCommand: jest.Mock;

  constructor() {
    const self = this;
    jest.mock('aws-xray-sdk', () => {
      return {
        captureAWSv3Client: (client: any) => client
      }
    });
    jest.mock('@aws-sdk/client-dynamodb', () => {
      return {
        PutItemCommand: function (params: any) { return self._putCommand(params); },
        GetItemCommand: function (params: any) { return self._getCommand(params); },
        QueryCommand: function (params: any) { return self._queryCommand(params); },
        DynamoDBClient: function () {
          return {
            send: (command: any) => self._send(command)
          }
        },
      }
    });
    this.init();
  }

  init() {
    this._send = jest.fn().mockResolvedValue({});
    this._putCommand = jest.fn().mockReturnValue({});
    this._getCommand = jest.fn().mockReturnValue({});
    this._queryCommand = jest.fn().mockReturnValue({});
  }

  get send() {
    return this._send;
  }

  get putCommand() {
    return this._putCommand;
  }

  get getCommand() {
    return this._getCommand;
  }

  get queryCommand() {
    return this._queryCommand;
  }
}


