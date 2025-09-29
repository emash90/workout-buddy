import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  // TODO: Implement authentication logic

  async login(email, password) {
    return {
      email: email,
      password: password
    }
  }
}