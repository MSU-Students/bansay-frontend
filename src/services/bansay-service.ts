import { AuthApi, type UserLoginDto, type UserRegisterDto } from './sdk'
const isDevEnv = process.env.NODE_ENV == 'development';
const baseUrl: string = isDevEnv ? 'http://localhost:3030' :
'http://ec2-18-219-109-27.us-east-2.compute.amazonaws.com:3030';

interface LoginResponse {
  message: string;
  accessToken: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export class BansayService {

  private static instance?: BansayService;
  private authApi = new AuthApi({
    basePath: baseUrl,
    isJsonMime: () => true,
  })

  private static readonly TOKEN_KEY = 'access_token';

  static getInstance() {
    this.instance = this.instance || new BansayService();
    return this.instance;
  }

  async loginUser(data: UserLoginDto) {
    const response = await this.authApi.authControllerLogin(data);
    if (response.status == 201 || response.status == 200) {
      const loginData = response.data as unknown as LoginResponse;

      if (loginData?.accessToken) {
        localStorage.setItem(BansayService.TOKEN_KEY, loginData.accessToken);
      }
      return loginData;
    } else {
      throw new Error(response.statusText || "Bad Request");
    }
  }

  async registerUser(data: UserRegisterDto) {
    const response = await this.authApi.authControllerRegister(data);
    if (response.status == 201 || response.status == 200) {
      return response.data;
    } else {
      throw new Error(response.statusText || "Bad Request");
    }
  }

  // Get stored access token
  getAccessToken(): string | null {
    return localStorage.getItem(BansayService.TOKEN_KEY);
  }

  // Remove access token (for logout)
  clearAccessToken(): void {
    localStorage.removeItem(BansayService.TOKEN_KEY);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

