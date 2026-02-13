import { Injectable } from '@nestjs/common';
import { ITestPort } from '../../domain/ports/test.port';

@Injectable()
export class TestService {
  constructor(private readonly testPort: ITestPort) {}

  async getTest() {
    return this.testPort.getTest();
  }
}
