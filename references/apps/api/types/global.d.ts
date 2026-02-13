interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: string;
  };
}
