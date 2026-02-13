export abstract class ITestPort {
  abstract getTest(): Promise<any>;
}
